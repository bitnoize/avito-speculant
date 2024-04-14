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

const sendreportProcessor: SendreportProcessor = async (sendreportJob) => {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)

  const sendreportResult: SendreportResult = {}

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
  }

  return sendreportResult
}

const processDefault: ProcessDefault = async function (
  config,
  logger,
  redis,
  sendreportJob,
  sendreportResult
) {
  try {
    const startTime = Date.now()
    const name = sendreportJob.name
    const { reportId } = sendreportJob.data

    const { reportCache } = await reportCacheService.stampReportCache(redis, {
      reportId
    })

    if (reportCache === undefined) {
      throw new ReportGoneAwayError({ reportId })
    }

    if (reportCache.attempt <= config.SENDREPORT_ATTEMPTS_LIMIT) {
      const { proxyCache } = await proxyCacheService.fetchRandomOnlineProxyCache(redis, undefined)

      if (proxyCache === undefined) {
        throw new OnlineProxiesUnavailableError({ reportCache })
      }

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
        advertCache.priceRub,
        advertCache.url,
        advertCache.age,
      )

      const message = await bot.api.sendPhoto(
        reportCache.tgFromId,
        'AAMCBQADGQEAARNXJ2JmLCEf98yfbH4IrxllIeSUBERZAAIeAAP2groPvWHPcxamOuYBAAdtAAMkBA',
        {
          caption,
          parse_mode: 'MarkdownV2'
        }
      )

      await bot.api.editMessageMedia(
        reportCache.tgFromId,
        message.message_id,
        InputMediaBuilder.photo(advertCache.imageUrl, {
          caption,
          parse_mode: 'MarkdownV2'
        })
      )
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
  }
}

export default sendreportProcessor

const renderReport = (
  id: number,
  title: string,
  description: string,
  priceRub: number,
  url: string,
  age: string,
): string => {
  return `**\\#${id}**\n` +
    `[${title}](${url})\n` +
    `${description.slice(0, 250)}...\n` +
    `Цена: **${priceRub}**\n` +
    `Опубликовано: ${age}\n`
}
