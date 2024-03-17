import { CurlImpersonate } from 'node-curl-impersonate'
import * as cheerio from 'cheerio'
import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import {
  redisService,
  subscriptionCacheService,
  categoryCacheService,
  proxyCacheService,
  scraperCacheService
} from '@avito-speculant/redis'
import { ScraperProcessor } from '@avito-speculant/queue'
import { Config } from './worker-scraper.js'
import { configSchema } from './worker-scraper.schema.js'

const scraperProcessor: ScraperProcessor = async (scraperJob) => {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)

  const { scraperJobId } = scraperJob.data

  const { scraperCache } = await scraperCacheService.fetchScraperCache(redis, {
    scraperJobId
  })

  const { proxyCache } = await proxyCacheService.randomProxyCacheOnline(redis)

  if (proxyCache === undefined) {
    logger.warn(`No available online proxy`)

    return
  }

  const response = await scraperRequest(
    scraperCache.avitoUrl,
    proxyCache.proxyUrl,
    10_000 // FIXME
  )

  if (response === undefined) {
    logger.warn(`Scraper request failed`)

    return
  }

  parseResponse(response, 'body > script:nth-child(5)')

  const { categoriesCache } = await categoryCacheService.fetchScraperCategoriesCache(redis, {
    scraperJobId: scraperCache.jobId
  })

  for (const categoryCache of categoriesCache) {
    const { subscriptionCache } = await subscriptionCacheService.fetchUserSubscriptionCache(redis, {
      userId: categoryCache.userId
    })

    // ...
  }

  logger.info(`ScraperJob complete`)

  await redisService.closeRedis(redis)
}

const scraperRequest = async (
  url: string,
  proxyUrl: string,
  timeout: number
): Promise<string | undefined> => {
  try {
    const curl = new CurlImpersonate(url, {
      method: 'GET',
      verbose: true,
      headers: [],
      impersonate: 'firefox-117',
      followRedirects: false,
      timeout,
    })
    const { statusCode, response } = await curl.makeRequest()

    return statusCode === 200 ? response : undefined
  } catch (error) {
    return undefined
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
