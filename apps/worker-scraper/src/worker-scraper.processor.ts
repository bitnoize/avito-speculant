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
      headerGeneratorOptions: {
        browsers: [
          {
            name: 'chrome',
            minVersion: 87,
            maxVersion: 89
          }
        ],
        devices: ['desktop'],
        locales: ['ru-RU'],
        operatingSystems: ['windows'],
      },
      responseType: 'buffer',
      followRedirect: false,
      throwHttpErrors: false,
      timeout: {
        request: timeout
      },
      retry: {
        limit: 0
      },
    })

    if (statusCode !== 200) {
      console.error(`Scraper response not success`)
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
