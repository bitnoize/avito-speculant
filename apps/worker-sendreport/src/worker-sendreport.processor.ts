import { HttpsProxyAgent } from 'https-proxy-agent'
import { Bot, InputMediaBuilder } from 'grammy'
import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { DomainError } from '@avito-speculant/common'
import {
  redisService,
  proxyCacheService,
  advertCacheService,
  reportCacheService
} from '@avito-speculant/redis'
import {
  OnlineProxiesUnavailableError,
  ReportGoneAwayError,
  SendreportResult,
  SendreportProcessor
} from '@avito-speculant/queue'
import { Config, ProcessDefault } from './worker-sendreport.js'
import { configSchema } from './worker-sendreport.schema.js'

const placeholder =
  'AgACAgIAAxkBAAIUwWYcePjD-IS7okQN3rZsiYZ49HeZAAIM3DEb3b_hSOSCzTy15IYdAQADAgADbQADNAQ'

const sendreportProcessor: SendreportProcessor = async (sendreportJob) => {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const sendreportResult: SendreportResult = {
    durationTime: 0
  }

  try {
    await processDefault(config, logger, redis, sendreportJob, sendreportResult)
  } catch (error) {
    if (error instanceof DomainError) {
      if (error.isEmergency()) {
        // ...

        logger.fatal(`SendreportWorker emergency shutdown`)
      }
    }

    throw error
  } finally {
    await redisService.closeRedis(redis)
  }

  return sendreportResult
}

const processDefault: ProcessDefault = async function (
  config,
  logger,
  sendreportJob,
  sendreportResult
) {
  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)

  try {
    const startTime = Date.now()
    const name = sendreportJob.name
    const { categoryId, advertId } = sendreportJob.data

    const { reportCache } = await reportCacheService.stampReportCache(redis, {
      categoryId,
      advertId
    })

    if (reportCache === undefined) {
      throw new ReportGoneAwayError({ reportId })
    }

    if (reportCache.attempt <= config.SENDREPORT_ATTEMPTS_LIMIT) {
      const { proxyCache } = await proxyCacheService.fetchRandomOnlineProxyCache(redis)

      const { advertCache } = await advertCacheService.fetchAdvertCache(redis, {
        advertId: reportCache.advertId
      })

      const bot = new Bot(config.BOT_TOKEN, {
        client: {
          baseFetchConfig: {
            agent: new HttpsProxyAgent(proxyCache.proxyUrl),
            compress: true
          }
        }
      })

      const caption = renderReport(
        advertCache.id,
        advertCache.title,
        advertCache.description,
        advertCache.categoryName,
        advertCache.priceRub,
        advertCache.url,
        advertCache.age
      )

      const message = await bot.api.sendPhoto(reportCache.tgFromId, placeholder, {
        caption,
        parse_mode: 'HTML'
      })

      if (advertCache.imageUrl !== '') {
        await bot.api.editMessageMedia(
          reportCache.tgFromId,
          message.message_id,
          InputMediaBuilder.photo(advertCache.imageUrl, {
            caption,
            parse_mode: 'HTML'
          })
        )
      }
    }

    await reportCacheService.dropReportCache(redis, {
      reportId: reportCache.id,
      categoryId: reportCache.categoryId,
      advertId: reportCache.advertId,
      postedAt: reportCache.postedAt
    })

    sendreportResult[name] = {
      durationTime: Date.now() - startTime
    }
  } catch (error) {
    if (error instanceof DomainError) {
      if (error instanceof OnlineProxiesUnavailableError) {
        // ...
      } else if (error instanceof ReportGoneAwayError) {
        // ...
      } else {
        error.setEmergency()
      }
    }

    throw error
  } finally {
    await redisService.closeRedis(redis)
  }
}

export default sendreportProcessor

const renderReport = (
  id: number,
  title: string,
  description: string,
  categoryName: string,
  priceRub: number,
  url: string,
  age: string
): string => {
  return (
    `<b>#${id}</b>\n` +
    `<a href="${url}">${title}</a>\n` +
    `${description}\n` +
    `Категория: <b>${categoryName}</b>\n` +
    `Цена: <b>${priceRub}</b>\n` +
    `Опубликовано: <b>${age}</b>\n`
  )
}
