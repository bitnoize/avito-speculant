import { loggerService } from '@avito-speculant/logger'
import { databaseService, userService } from '@avito-speculant/database'
import { redisService } from '@avito-speculant/redis'
import { queueService, scraperService } from '@avito-speculant/queue'
import { Config, config } from './config.js'

async function bootstrap(): Promise<void> {
  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
  const db = databaseService.initDatabase(databaseConfig, logger)

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)

  const queueConnection = queueService.getQueueConnection<Config>(config)

  const scraperQueue = scraperService.initQueue(queueConnection, logger)

  logger.info(`Okey!`)

  await databaseService.closeDatabase(db, logger)
  await redisService.closeRedis(redis, logger)
  await scraperService.closeQueue(scraperQueue, logger)
}

bootstrap()
