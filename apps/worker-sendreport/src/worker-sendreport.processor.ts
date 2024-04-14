import { HttpsProxyAgent } from 'https-proxy-agent'
import { Bot } from 'grammy'
import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { DomainError } from '@avito-speculant/common'
import {
  redisService,
  proxyCacheService,
  advertCacheService,
  reportCacheService,
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

const processDefault: ProcessDefault = async function(
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
      const { proxyCache } = await proxyCacheService.fetchRandomOnlineProxyCache(
        redis,
        undefined
      )

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

      await bot.api.sendMessage(
        reportCache.tgFromId,
        `Id: ${advertCache.id}\n` +
        `Title: ${advertCache.title}\n` +
        `Description: ${advertCache.description.slice(0, 500)}\n` +
        `PriceRub: ${advertCache.priceRub}\n` +
        `Url: ${advertCache.url}\n` +
        `Age: ${advertCache.age}\n` +
        `ImageUrl: ${advertCache.imageUrl}`
      )
    }

    await reportCacheService.dropReportCache(redis, {
      reportId: reportCache.id,
      categoryId: reportCache.categoryId,
      advertId: reportCache.advertId,
      postedAt: reportCache.postedAt,
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
