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
        "Host": "avito.ru",
        "Connection": "keep-alive",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.124 Safari/537.36",
        "sec-ch-ua": 'Chromium";v="104", " Not A;Brand";v="99", "Yandex";v="22',
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-Mode": "navigate",
        "sec-ch-ua-platform": "Windows",
      },
      responseType: 'buffer',
      followRedirect: false,
      timeout: {
        request: timeout
      },
    })

    return statusCode === 200 ? body : undefined
  } catch (error) {
    return undefined
  }
}

const parseResponse = (body: Buffer, selector: string): void => {
  try {
    const $ = cheerio.load(body.toString('utf8'))

    const initialData = decodeURI($('body > script:nth-child(5)').text())

    console.log(`Success`)
    console.log(initialData)
  } catch (error) {
    return
  }
}

export default scraperProcessor
