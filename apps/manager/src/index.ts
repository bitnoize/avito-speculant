import { getLoggerOptions, initLogger } from '@avito-speculant/logger'
import {
  getDatabaseConfig,
  initDatabase,
  migrateToLatest
} from '@avito-speculant/database'
import { getRedisOptions, initRedis } from '@avito-speculant/redis'
import { Config, config } from './config.js'

async function bootstrap(): Promise<void> {
  const loggerOptions = getLoggerOptions<Config>(config)
  const logger = initLogger(loggerOptions)

  const databaseConfig = getDatabaseConfig<Config>(config)
  const db = initDatabase(databaseConfig, logger)

  const redisOptions = getRedisOptions<Config>(config)
  const redis = initRedis(redisOptions, logger)

  await migrateToLatest(db, logger)

  await redis.disconnect()
  await db.destroy()
}

bootstrap()
