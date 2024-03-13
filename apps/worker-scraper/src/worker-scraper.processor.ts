import { gotScraping } from 'got-scraping'
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

  const { scraperCache } = await scraperCacheService.fetchScraperCache(redis, {
    scraperJobId: scraperJob.data.scraperJobId
  })

  const { proxyCache } = await proxyCacheService.randomProxyCacheOnline(redis)

  if (proxyCache === undefined) {
    logger.warn(`No available online proxy`)

    return
  }

  const { categoriesCache } = await categoryCacheService.fetchScraperCategoriesCache(redis, {
    scraperJobId: scraperCache.jobId
  })

  const body = await scraperRequest(
    proxyCache.proxyUrl,
    scraperCache.avitoUrl,
    10_000,
  )

  if (body === undefined) {
    logger.warn(`Scraper request failed`)

    return
  }

  parseResponse(body, 'body > script:nth-child(5)')

  for (const categoryCache of categoriesCache) {
    const { subscriptionCache } = await subscriptionCacheService.fetchUserSubscriptionCache(redis, {
      userId: categoryCache.userId
    })

    logger.info({ subscriptionCache }, `SubscriptionCache dump`)
  }

  logger.info(`ScraperJob complete`)

  await redisService.closeRedis(redis)
}

const scraperRequest = async (
  proxyUrl: string,
  avitoUrl: string,
  timeout: number,
): Promise<Buffer | undefined> => {
  try {
    const { statusCode, body } = await gotScraping.get({
      proxyUrl,
      url: avitoUrl,
      headers: {
          "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "accept-language": "ru,en;q=0.9",
          "cache-control": "max-age=0",
          "sec-ch-ua": "\"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"114\", \"YaBrowser\";v=\"23\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\"",
          "sec-fetch-dest": "document",
          "sec-fetch-mode": "navigate",
          "sec-fetch-site": "none",
          "sec-fetch-user": "?1",
          "upgrade-insecure-requests": "1"
      },
      responseType: 'buffer',
      followRedirect: false,
      timeout: {
        request: timeout
      },
    })

    if (statusCode !== 200) {
      console.error(`Scraper response not success: ${statusCode} via proxy ${proxyUrl}`)
    }

    return statusCode === 200 ? body : undefined
  } catch (error) {
    return undefined
  }
}

const parseResponse = (body: Buffer, selector: string): void => {
  try {
    const $ = cheerio.load(body.toString('utf8'))

    const initialData = decodeURI($('body > script:nth-child(5)').text())

    console.dir(initialData)
  } catch (error) {
    return
  }
}

export default scraperProcessor
