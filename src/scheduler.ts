import config from './config.js'
import { getLoggerOptions, initLogger } from './logger.js'
import { getDatabaseConfig, initDatabase } from './database/index.js'
import { getRedisOptions, initRedis } from './redis/index.js'
import { getQueueConnection, initScraperQueue } from './queue/index.js'

async function bootstrap(): Promise<void> {
  const loggerOptions = getLoggerOptions(config)
  const logger = initLogger(loggerOptions)

  const databaseConfig = getDatabaseConfig(config)
  const db = initDatabase(databaseConfig, logger)

  const redisOptions = getRedisOptions(config)
  const redis = initRedis(redisOptions, logger)

  const queueConnection = getQueueConnection(config)

  const scraperQueue = initScraperQueue(queueConnection, logger)

  logger.info(`Okey!`)
}

bootstrap()
