import { loggerService } from '@avito-speculant/logger'
import { databaseService } from '@avito-speculant/database'
import { redisService } from '@avito-speculant/redis'
import { Config, config } from './config.js'

async function bootstrap(): Promise<void> {
  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
  const db = databaseService.initDatabase(databaseConfig, logger)

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)

  await databaseService.migrateToLatest(db, logger)

  await databaseService.closeDatabase(db, logger)
  await redisService.closeRedis(redis, logger)
}

bootstrap().catch((error) => {
  console.error(error)
  process.exit(1)
})
