import { gotScraping } from 'got-scraping'
import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { redisService, proxyCacheService, scraperCacheService } from '@avito-speculant/redis'
import { ScraperProcessor } from '@avito-speculant/queue'
import { Config } from './worker-scraper.js'
import { configSchema } from './worker-scraper.schema.js'

const scraperProcessor: ScraperProcessor = async (scraperJob) => {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)

  if (scraperJob.id === undefined) {
    throw new Error(`ScraperJob lost id`)
  }

  const { scraperCache } = await scraperCacheService.fetchScraperCache(redis, {
    scraperJobId: scraperJob.id
  })

  const { proxyCache } = await proxyCacheService.randomProxyCacheOnline(redis)

  if (proxyCache === undefined) {
    throw new Error(`Can't allocate proxy`)
  }

  logger.info(`ScraperJob complete`)

  await redisService.closeRedis(redis)
}

const scraperRequest = async (
  proxyUrl: string,
  avitoUrl: string,
  timeout: number
): Promise<boolean> => {
  try {
    const response = await gotScraping.get({
      proxyUrl,
      url: avitoUrl,
      followRedirect: false,
      throwHttpErrors: false,
      timeout: {
        request: timeout
      },
      retry: {
        limit: 0
      },
    })

    return response.statusCode === 200 ? true : false
  } catch (error) {
    console.error(error)

    return false
  }
}
export default scraperProcessor
