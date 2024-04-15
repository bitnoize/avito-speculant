import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { DomainError } from '@avito-speculant/common'
import {
  redisService,
  proxyCacheService,
  scraperCacheService,
  advertCacheService
} from '@avito-speculant/redis'
import {
  OnlineProxiesUnavailableError,
  ScrapingResult,
  ScrapingProcessor
} from '@avito-speculant/queue'
import { Config, ProcessDefault, CurlRequestArgs } from './worker-scraping.js'
import { configSchema } from './worker-scraping.schema.js'
import { timeoutAdjust, curlRequest, parseAttempt } from '././worker-scraping.utils.js'

const scrapingProcessor: ScrapingProcessor = async function (scrapingJob) {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)

  const scrapingResult: ScrapingResult = {}

  try {
    await processDefault(config, logger, redis, scrapingJob, scrapingResult)
  } catch (error) {
    if (error instanceof DomainError) {
      if (error.isEmergency()) {
        // ...

        logger.fatal(`ScrapingWorker emergency shutdown`)
      }
    }

    throw error
  } finally {
    await redisService.closeRedis(redis)
  }

  return scrapingResult
}

const processDefault: ProcessDefault = async function (
  config,
  logger,
  redis,
  scrapingJob,
  scrapingResult
) {
  try {
    const startTime = Date.now()
    const name = scrapingJob.name
    const { scraperId } = scrapingJob.data

    const { scraperCache } = await scraperCacheService.fetchScraperCache(redis, {
      scraperId
    })

    const { proxyCache } = await proxyCacheService.fetchRandomOnlineProxyCache(redis, undefined)

    if (proxyCache === undefined) {
      throw new OnlineProxiesUnavailableError({ scraperCache })
    }

    const avitoUrl = new URL(scraperCache.avitoUrl, 'https://www.avito.ru')

    avitoUrl.searchParams.set('s', '104')

    const curlRequestArgs: CurlRequestArgs = [
      avitoUrl.toString(),
      proxyCache.proxyUrl,
      timeoutAdjust(scraperCache.intervalSec),
      config.SCRAPING_REQUEST_VERBOSE
    ]

    const curlResponse = await curlRequest(...curlRequestArgs)

    if (curlResponse.error !== undefined) {
      await scraperCacheService.renewFailedScraperCache(redis, {
        scraperId: scraperCache.id,
        proxyId: proxyCache.id,
        sizeBytes: curlResponse.sizeBytes
      })

      const logData = {
        scraperCache,
        proxyCache,
        curlRequestArgs,
        curlResponse
      }
      logger.warn(logData, `ScrapingProcessor processDefault curlRequest failed`)

      scrapingResult[name] = {
        success: false,
        statusCode: curlResponse.statusCode,
        sizeBytes: curlResponse.sizeBytes,
        durationTime: Date.now() - startTime,
        curlDurationTime: curlResponse.durationTime,
        parseDurationTime: 0,
        totalAdverts: 0
      }

      return
    }

    if (curlResponse.statusCode !== 200) {
      await scraperCacheService.renewFailedScraperCache(redis, {
        scraperId: scraperCache.id,
        proxyId: proxyCache.id,
        sizeBytes: curlResponse.sizeBytes
      })

      scrapingResult[name] = {
        success: false,
        statusCode: curlResponse.statusCode,
        sizeBytes: curlResponse.sizeBytes,
        durationTime: Date.now() - startTime,
        curlDurationTime: curlResponse.durationTime,
        parseDurationTime: 0,
        totalAdverts: 0
      }

      return
    }

    const parseResult = parseAttempt(curlResponse.body)

    if (parseResult.error !== undefined) {
      await scraperCacheService.renewFailedScraperCache(redis, {
        scraperId: scraperCache.id,
        proxyId: proxyCache.id,
        sizeBytes: curlResponse.sizeBytes
      })

      const logData = {
        scraperCache,
        proxyCache,
        parseResult
      }
      logger.warn(logData, `ScrapingProcessor processDefault parseAttempt failed`)

      scrapingResult[name] = {
        success: false,
        statusCode: curlResponse.statusCode,
        sizeBytes: curlResponse.sizeBytes,
        durationTime: Date.now() - startTime,
        curlDurationTime: curlResponse.durationTime,
        parseDurationTime: parseResult.durationTime,
        totalAdverts: parseResult.totalAdverts
      }

      return
    }

    await scraperCacheService.renewSuccessScraperCache(redis, {
      scraperId: scraperCache.id,
      proxyId: proxyCache.id,
      sizeBytes: curlResponse.sizeBytes
    })

    await advertCacheService.saveAdvertsCache(redis, {
      scraperId: scraperCache.id,
      avitoAdverts: parseResult.avitoAdverts
    })

    scrapingResult[name] = {
      success: true,
      statusCode: curlResponse.statusCode,
      sizeBytes: curlResponse.sizeBytes,
      durationTime: Date.now() - startTime,
      curlDurationTime: curlResponse.durationTime,
      parseDurationTime: parseResult.durationTime,
      totalAdverts: parseResult.totalAdverts
    }
  } catch (error) {
    if (error instanceof DomainError) {
      if (error instanceof OnlineProxiesUnavailableError) {
        // ...
      } else {
        error.setEmergency()
      }
    }

    throw error
  }
}

export default scrapingProcessor
