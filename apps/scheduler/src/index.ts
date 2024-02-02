import { getLoggerOptions, initLogger } from '@avito-speculant/logger'
import { getDatabaseConfig, initDatabase } from '@avito-speculant/database'
import { getRedisOptions, initRedis } from '@avito-speculant/redis'
import { getQueueConnection, initScraperQueue } from '@avito-speculant/queue'
import { Config, config } from './config.js'

async function bootstrap(): Promise<void> {
  const loggerOptions = getLoggerOptions<Config>(config)
  const logger = initLogger(loggerOptions)

  const databaseConfig = getDatabaseConfig<Config>(config)
  const db = initDatabase(databaseConfig, logger)

  const redisOptions = getRedisOptions<Config>(config)
  const redis = initRedis(redisOptions, logger)

  const queueConnection = getQueueConnection<Config>(config)

  const scraperQueue = initScraperQueue(queueConnection, logger)

  logger.info(`Okey!`)
}

bootstrap()
