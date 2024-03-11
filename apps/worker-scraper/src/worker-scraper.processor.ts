import got, { Got, Method, Agents, RequestError } from 'got'
import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { redisService, systemService, scraperCacheService } from '@avito-speculant/redis'
import { ScraperProcessor } from '@avito-speculant/queue'
import { Config } from './worker-scraper.js'
import { configSchema } from './worker-scraper.schema.js'

const scraperProcessor: ScraperProcessor = async (scraperJob, token) => {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)
  const pubSub = redisService.initPubSub(redisOptions, logger)

  switch (scraperJob.name) {
    case 'data-static': {
      break
    }

    default: {
      throw new Error(`ScraperJob unknown name`)
    }
  }

  await redisService.closePubSub(pubSub)
  await redisService.closeRedis(redis)
}

export default scraperProcessor
