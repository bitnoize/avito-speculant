import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { redisService } from '@avito-speculant/redis'
import {
  BusinessResult,
  BusinessJob,
  BusinessProcessor
} from '@avito-speculant/queue'
import { Config } from './worker-business.js'
import { configSchema } from './worker-business.schema.js'

export const businessProcessor: BusinessProcessor = async (businessJob: BusinessJob) => {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)
  const pubSub = redisService.initPubSub(redisOptions, logger)

  // TODO

  await redisService.closeRedis(redis, logger)
}
