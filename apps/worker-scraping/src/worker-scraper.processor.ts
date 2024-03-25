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
  ProcessUnknownNameError,
  OnlineProxyUnavailableError,
  ScraperResult,
  ScraperProcessor
} from '@avito-speculant/queue'
import { Config } from './worker-scraper.js'
import { configSchema } from './worker-scraper.schema.js'

const scraperProcessor: ScraperProcessor = async (scraperJob) => {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)

  const result: ScraperResult = {}

  try {
    const name = scraperJob.name

    switch (name) {
      case 'curl-impersonate': {
        result[name] = await processCurlImpersonate(config, logger, redis, scrapingJob)

        break
      }

      default: {
        throw new ProcessUnknownNameError({ name })
      }
    }





    const scraperResponse = await scraperRequest(
      proxyCache.proxyUrl,
      scraperCache.intervalSec,
      true
    )

    if (scraperResponse.statusCode === 200) {
      parseResponse(scraperResponse.body, 'body > script:nth-child(5)')

      const { categoriesCache } = await categoryCacheService.fetchScraperCategoriesCache(redis, {
        scraperJobId: scraperCache.jobId
      })

      for (const categoryCache of categoriesCache) {
        const { subscriptionCache } = await subscriptionCacheService.fetchUserSubscriptionCache(redis, {
          userId: categoryCache.userId
        })

        // ...
      }

    } else {
      await scraperCacheService.renewScraperCacheFailed(redis, {
        scraperJobId: scraperCache.jobId,
        size: scraperResponse.size
      })

      result = {
        isSuccess: false,
        size: scraperResponse.size
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
      scraperId: scraperJob.data.scraperId
    })

    const { proxyCache } = await proxyCacheService.randomProxyCacheOnline(redis)

    if (proxyCache === undefined) {
      throw new OnlineProxyUnavailableError(scraperCache)
    }

    const curlImpersonateResponse = await curlImpersonateRequest(
      scraperCache.avitoUrl,
      proxyCache.proxyUrl,
      scraperCache.intervalSec,
      true
    )

    if (curlImpersonateResponse !== undefined) {
      if (curlImpersonateResponse.statusCode === 200) {
        await scraperCacheService.renewScraperCacheSuccess(redis, {
          scraperId: scraperCache.id
        })

        await proxyCacheService.renewProxyCacheSuccess(redis, {
          proxyId: proxyCache.id
        })

        return {
          scraperId: scraperCache.id,
          proxyId: proxyCache.id,
          statusCode: curlImpersonateResponse.statusCode,
        }
      } else {
        await proxyCacheService.renewProxyCacheOffline(redis, {
          proxyId: proxyCache.id
        })

        return {
          id: proxyCache.id,
          statusCode: curlImpersonateResponse.statusCode,
          isOnline: false,
        }
      }
    } else {
      await proxyCacheService.renewProxyCacheOffline(redis, {
        proxyId: proxyCache.id
      })

      return {
        id: proxyCache.id,
        isOnline: false,
        statusCode: 0
      }
    }
  } catch (error) {
    logger.error(`ProxycheckProcessor processCurlImpersonate exception`)

    throw error.setEmergency()
  }
}



const scraperRequest: ScraperRequest = async(avitoUrl, proxyUrl, timeout, verbose) => {
  try {
    const curlImpersonate = new CurlImpersonate(avitoUrl, {
      method: 'GET',
      impersonate: 'firefox-117',
      headers: [],
      timeout,
      verbose,
      followRedirects: false,
      flags: [
        '--insecure',
        `--proxy ${proxyUrl}`
      ]
    })

    const curlResponse = await curlImpersonate.makeRequest()

    return {
      statusCode: curlResponse.statusCode,
      body: curlResponse.response,
      size: Buffer.byteLength(curlResponse.response, 'utf8')
    }
  } catch (error) {
    throw new ScraperRequestError(
      {
        avitoUrl,
        proxyUrl,
        timeout,
        verbose
      },
      100,
      error.message
    )
  }
}

const parseResponse = (response: string, selector: string): void => {
  try {
    //const $ = cheerio.load(body.toString('utf8'))

    //const initialData = decodeURI($('body > script:nth-child(5)').text())

    console.log(response)
  } catch (error) {
    return
  }
}

export default scraperProcessor
