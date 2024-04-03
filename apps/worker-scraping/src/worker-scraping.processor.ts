import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { DomainError } from '@avito-speculant/common'
import {
  redisService,
  subscriptionCacheService,
  categoryCacheService,
  proxyCacheService,
  scraperCacheService,
  advertCacheService
} from '@avito-speculant/redis'
import {
  ProcessorUnknownNameError,
  OnlineProxiesUnavailableError,
  ScrapingResult,
  ScrapingProcessor
} from '@avito-speculant/queue'
import { Config, NameProcess, CurlRequestArgs } from './worker-scraping.js'
import { configSchema } from './worker-scraping.schema.js'
import { timeoutAdjust, curlRequest, parseAttempt } from '././worker-scraping.utils.js'

const scrapingProcessor: ScrapingProcessor = async (scrapingJob) => {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)

  const result: ScrapingResult = {}

  try {
    const name = scrapingJob.name

    switch (name) {
      case 'desktop': {
        result[name] = await processDesktop(config, logger, redis, scrapingJob)

        break
      }

      default: {
        throw new ProcessorUnknownNameError({ name })
      }
    }
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

  return result
}

const processDesktop: NameProcess = async (config, logger, redis, scrapingJob) => {
  try {
    const startTime = Date.now()

    const { scraperCache } = await scraperCacheService.fetchScraperCache(redis, {
      scraperId: scrapingJob.data.scraperId
    })

    const { proxyCache } = await proxyCacheService.fetchRandomOnlineProxyCache(redis)

    if (proxyCache === undefined) {
      throw new OnlineProxiesUnavailableError({ scraperCache })
    }

    const curlRequestArgs: CurlRequestArgs = [
      scraperCache.avitoUrl,
      proxyCache.proxyUrl,
      timeoutAdjust(scraperCache.intervalSec),
      false
    ]

    const curlResponse = await curlRequest(...curlRequestArgs)

    if (curlResponse.error !== undefined) {
      await scraperCacheService.renewFailedScraperCache(redis, {
        scraperId: scraperCache.id,
        proxyId: proxyCache.id,
        sizeBytes: 0
      })

      const logData = {
        scraperCache,
        proxyCache,
        curlRequestArgs,
        curlResponse
      }
      logger.warn(logData, `ScrapingProcessor processDesktop curlRequest failed`)

      return {
        scraperId: scraperCache.id,
        proxyId: proxyCache.id,
        success: false,
        statusCode: 0,
        sizeBytes: 0,
        durationTime: Date.now() - startTime,
        curlDurationTime: curlResponse.durationTime,
        parseDurationTime: 0
      }
    }

    if (curlResponse.statusCode !== 200) {
      await scraperCacheService.renewFailedScraperCache(redis, {
        scraperId: scraperCache.id,
        proxyId: proxyCache.id,
        sizeBytes: curlResponse.sizeBytes
      })

      return {
        scraperId: scraperCache.id,
        proxyId: proxyCache.id,
        success: false,
        statusCode: curlResponse.statusCode,
        sizeBytes: curlResponse.sizeBytes,
        durationTime: Date.now() - startTime,
        curlDurationTime: curlResponse.durationTime,
        parseDurationTime: 0
      }
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
      logger.error(logData, `ScrapingProcessor processDesktop parseAttempt failed`)

      return {
        scraperId: scraperCache.id,
        proxyId: proxyCache.id,
        success: false,
        statusCode: curlResponse.statusCode,
        sizeBytes: curlResponse.sizeBytes,
        durationTime: Date.now() - startTime,
        curlDurationTime: curlResponse.durationTime,
        parseDurationTime: parseResult.durationTime
      }
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

    const { categoriesCache } = await categoryCacheService.fetchScraperCategoriesCache(redis, {
      scraperId: scraperCache.id
    })

    for (const categoryCache of categoriesCache) {
      const { subscriptionCache } = await subscriptionCacheService.fetchUserSubscriptionCache(
        redis,
        {
          userId: categoryCache.userId
        }
      )

      // ...
    }

    return {
      scraperId: scraperCache.id,
      proxyId: proxyCache.id,
      success: true,
      statusCode: curlResponse.statusCode,
      sizeBytes: curlResponse.sizeBytes,
      durationTime: Date.now() - startTime,
      curlDurationTime: curlResponse.durationTime,
      parseDurationTime: parseResult.durationTime
    }
  } catch (error) {
    if (error instanceof DomainError) {
      if (error instanceof OnlineProxiesUnavailableError) {
        logger.warn(`ScrapingProcessor processDesktop no online proxies available`)
      } else {
        error.setEmergency()
      }
    }

    throw error
  }
}

export default scrapingProcessor
