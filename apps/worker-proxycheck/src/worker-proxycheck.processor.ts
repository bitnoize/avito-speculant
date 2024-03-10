import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { redisService } from '@avito-speculant/redis'
import { ScraperJob, ScraperResult, ScraperProcessor } from '@avito-speculant/queue'
import { Config } from './worker-proxycheck.js'
import { configSchema } from './worker-proxycheck.schema.js'

export const proxycheckProcessor: ProxycheckProcessor = async (proxycheckJob: ProxycheckJob) => {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)
  const pubSub = redisService.initPubSub(redisOptions, logger)

  // TODO

  await redisService.closeRedis(redis, logger)
}
