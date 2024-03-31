import Ajv, { JSONSchemaType } from 'ajv'
import { curly, CurlyResult } from 'node-libcurl'
import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { DomainError } from '@avito-speculant/common'
import {
  redisService,
  subscriptionCacheService,
  categoryCacheService,
  proxyCacheService,
  scraperCacheService
} from '@avito-speculant/redis'
import {
  ProcessorUnknownNameError,
  OnlineProxyUnavailableError,
  ScrapingResult,
  ScrapingProcessor
} from '@avito-speculant/queue'
import { Config, CurlRequest, Process } from './worker-scraping.js'
import { configSchema } from './worker-scraping.schema.js'

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
      case 'curl': {
        result[name] = await processCurl(config, logger, redis, scrapingJob)

        break
      }

      default: {
        throw new ProcessorUnknownNameError({ name })
      }
    }
  } catch (error) {
    if (error instanceof DomainError) {
      if (error instanceof ProcessorUnknownNameError) {
        error.setEmergency()
      }

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

const processCurl: Process = async (config, logger, redis, scrapingJob) => {
  try {
    const { scraperCache } = await scraperCacheService.fetchScraperCache(redis, {
      scraperId: scrapingJob.data.scraperId
    })

    const { proxyCache } = await proxyCacheService.randomProxyCacheOnline(redis)

    if (proxyCache === undefined) {
      throw new OnlineProxyUnavailableError({ scraperCache })
    }

    const curlResponse = await curlRequest(
      scraperCache.avitoUrl,
      proxyCache.proxyUrl,
      scraperCache.intervalSec,
      false
    )

    if (curlResponse.error !== undefined) {
      await scraperCacheService.renewScraperCacheFailed(redis, {
        scraperId: scraperCache.id,
        proxyId: proxyCache.id,
        sizeBytes: 0
      })

      const logData = {
        scraperCache,
        proxyCache,
        error: curlResponse.error
      }
      logger.error(logData, `ScrapingProcessor curlRequest failed`)

      return {
        scraperId: scraperCache.id,
        proxyId: proxyCache.id,
        success: false,
        statusCode: 0,
        sizeBytes: 0
      }
    }

    if (curlResponse.statusCode !== 200) {
      await scraperCacheService.renewScraperCacheFailed(redis, {
        scraperId: scraperCache.id,
        proxyId: proxyCache.id,
        sizeBytes: curlResponse.body.length
      })

      return {
        scraperId: scraperCache.id,
        proxyId: proxyCache.id,
        success: false,
        statusCode: curlResponse.statusCode,
        sizeBytes: curlResponse.body.length
      }
    }

    curlParse(curlResponse)

    await scraperCacheService.renewScraperCacheSuccess(redis, {
      scraperId: scraperCache.id,
      proxyId: proxyCache.id,
      sizeBytes: curlResponse.body.length
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
      sizeBytes: curlResponse.body.length
    }
  } catch (error) {
    if (error instanceof DomainError) {
      if (error instanceof OnlineProxyUnavailableError) {
        logger.warn(`ScrapingProcessor no online proxy available in proxy-pool`)
      } else {
        error.setEmergency()
      }
    }

    throw error
  }
}

const curlRequest: CurlRequest = async (
  avitoUrl,
  proxyUrl,
  timeoutMs,
  verbose
) => {
  try {
    const { statusCode, data } = await curly.get(avitoUrl, {
      proxy: proxyUrl,
      timeoutMs,
      verbose
    })

    return {
      statusCode,
      body: data
    }
  } catch (error) {
    return {
      statusCode: 0,
      body: Buffer.alloc(0),
      error: error.message
    }
  }
}

const curlParse = (data: Buffer): void => {
  try {
    const body = data.toString()

    const indexStart = body.indexOf('window.__initial') + 'window.__initialData__ = "'.length
    const indexEnd = body.indexOf('window.__locations__')
    const initialData = body.substring(indexStart, indexEnd).trim().slice(0, -2)

    const ads = JSON.parse(decodeURIComponent(initialData))
    console.dir(ads, { depth: 8 })
  } catch (error) {
    return
  }
}

export default scrapingProcessor
