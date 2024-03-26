import * as fs from 'fs'
import { CurlImpersonate } from 'node-curl-impersonate'
import * as cheerio from 'cheerio'
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
import { Config, CurlImpersonateRequest, Process } from './worker-scraping.js'
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
      case 'curl-impersonate': {
        result[name] = await processCurlImpersonate(config, logger, redis, scrapingJob)

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

const processCurlImpersonate: Process = async (config, logger, redis, scrapingJob) => {
  try {
    const { scraperCache } = await scraperCacheService.fetchScraperCache(redis, {
      scraperId: scrapingJob.data.scraperId
    })

    const { proxyCache } = await proxyCacheService.randomProxyCacheOnline(redis)

    if (proxyCache === undefined) {
      throw new OnlineProxyUnavailableError(scraperCache)
    }

    const curlImpersonateResponse = await curlImpersonateRequest(
      scraperCache.avitoUrl,
      proxyCache.proxyUrl,
      scraperCache.intervalSec,
      false
    )

    if (curlImpersonateResponse !== undefined) {
      if (curlImpersonateResponse.statusCode === 200) {
        await scraperCacheService.renewScraperCacheSuccess(redis, {
          scraperId: scraperCache.id,
          proxyId: proxyCache.id,
          sizeBytes: curlImpersonateResponse.sizeBytes
        })

        curlImpersonateParse(curlImpersonateResponse.body, 'body > script:nth-child(5)')

        const { categoriesCache } = await categoryCacheService.fetchScraperCategoriesCache(redis, {
          scraperId: scraperCache.id
        })

        for (const categoryCache of categoriesCache) {
          const { subscriptionCache } = await subscriptionCacheService.fetchUserSubscriptionCache(redis, {
            userId: categoryCache.userId
          })

          // ...
        }

        return {
          scraperId: scraperCache.id,
          proxyId: proxyCache.id,
          success: true,
          statusCode: curlImpersonateResponse.statusCode,
          sizeBytes: curlImpersonateResponse.sizeBytes
        }
      } else {
        await scraperCacheService.renewScraperCacheFailed(redis, {
          scraperId: scraperCache.id,
          proxyId: proxyCache.id,
          sizeBytes: curlImpersonateResponse.sizeBytes
        })

        return {
          scraperId: scraperCache.id,
          proxyId: proxyCache.id,
          success: false,
          statusCode: curlImpersonateResponse.statusCode,
          sizeBytes: curlImpersonateResponse.sizeBytes
        }
      }
    } else {
      await scraperCacheService.renewScraperCacheFailed(redis, {
        scraperId: scraperCache.id,
        proxyId: proxyCache.id,
        sizeBytes: 0
      })

      // ...

      return {
        scraperId: scraperCache.id,
        proxyId: proxyCache.id,
        success: false,
        statusCode: 0,
        sizeBytes: 0
      }
    }
  } catch (error) {
    if (error instanceof DomainError) {
      if (error instanceof OnlineProxyUnavailableError) {
        logger.warn(`ScrapingProcessor no online proxy available`)
      } else {
        logger.error(`ScrapingProcessor processCurlImpersonate exception`)

        error.setEmergency()
      }
    }

    throw error
  }
}

const curlImpersonateRequest: CurlImpersonateRequest = async(
  avitoUrl,
  proxyUrl,
  timeout,
  verbose
) => {
  try {
    const curlImpersonate = new CurlImpersonate(avitoUrl, {
      method: 'GET',
      impersonate: 'firefox-117',
      headers: [],
      verbose,
      followRedirects: false,
      flags: [
        '--insecure',
        `--max-time ${timeout}`,
        `--proxy ${proxyUrl}`
      ]
    })

    const { statusCode, response } = await curlImpersonate.makeRequest()

    return {
      statusCode: statusCode ?? 0,
      body: response,
      sizeBytes: Buffer.byteLength(response)
    }
  } catch (error) {
    console.log(error)
    return undefined
  }
}

const curlImpersonateParse = (body: string, target: string): void => {
  try {
    const indexStart = body.indexOf('window.__initial') + 'window.__initialData__ = "'.length
    const indexEnd = body.indexOf('window.__locations__')
    const initialData = body.substring(indexStart, indexEnd).trim().slice(0, -2)
    console.log(`indexStart: ${indexStart}  indexEnd: ${indexEnd}`)

    fs.writeFileSync('/tmp/data.txt', initialData)
    fs.writeFileSync('/tmp/data.orig', body)

    const ads = JSON.parse(decodeURIComponent(initialData))
    console.log(ads)
  } catch (error) {
    return
  }
}

export default scrapingProcessor
