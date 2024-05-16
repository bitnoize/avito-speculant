import { HttpsProxyAgent } from 'https-proxy-agent'
import { Bot, InputMediaBuilder, InputFile } from 'grammy'
import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import {
  redisService,
  proxyCacheService,
  advertCacheService,
  reportCacheService
} from '@avito-speculant/redis'
import {
  SENDREPORT_ATTEMPTS_LIMIT,
  SendreportReportError,
  SendreportResult,
  SendreportProcessor
} from '@avito-speculant/queue'
import { Config, ProcessName } from './worker-sendreport.js'
import { configSchema } from './worker-sendreport.schema.js'

const sendreportProcessor: SendreportProcessor = async (sendreportJob) => {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const sendreportResult: SendreportResult = {
    durationTime: 0
  }

  await processDefault(config, logger, sendreportJob, sendreportResult)

  return sendreportResult
}

const processDefault: ProcessName = async function (
  config,
  logger,
  sendreportJob,
  sendreportResult
) {
  const startTime = Date.now()
  const { categoryId, advertId } = sendreportJob.data

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)

  try {
    const { reportCache } = await reportCacheService.stampReportCache(redis, {
      categoryId,
      advertId
    })

    if (reportCache === undefined) {
      throw new SendreportReportError({})
    }

    if (reportCache.attempt <= SENDREPORT_ATTEMPTS_LIMIT) {
      const { proxyCache } = await proxyCacheService.fetchRandomOnlineProxyCache(redis)

      const { advertCache } = await advertCacheService.fetchAdvertCache(redis, {
        scraperId: reportCache.scraperId,
        advertId: reportCache.advertId
      })

      const bot = new Bot(reportCache.token, {
        client: {
          baseFetchConfig: {
            agent: new HttpsProxyAgent(proxyCache.url),
            compress: true
          }
        }
      })

      const caption = renderReport(
        advertCache.advertId,
        advertCache.title,
        advertCache.description,
        advertCache.categoryName,
        advertCache.priceRub,
        advertCache.url,
        advertCache.age
      )

      const placeholder = new InputFile('/tmp/placeholder.png')

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
      categoryId: reportCache.categoryId,
      advertId: reportCache.advertId
    })
  } finally {
    await redisService.closeRedis(redis)

    sendreportResult.durationTime = Date.now() - startTime
  }
}

export default sendreportProcessor

const renderReport = (
  advertId: number,
  title: string,
  description: string,
  categoryName: string,
  priceRub: number,
  url: string,
  age: string
): string => {
  return (
    `<b>#${advertId}</b>\n` +
    `<a href="${url}">${title}</a>\n` +
    `${description.slice(0, 200)}\n` +
    `Категория: <b>${categoryName}</b>\n` +
    `Цена: <b>${priceRub}</b>\n` +
    `Опубликовано: <b>${age}</b>\n`
  )
}
