import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { databaseService } from '@avito-speculant/database'
import { redisService } from '@avito-speculant/redis'
import { queueService, schedulerService } from '@avito-speculant/queue'
import { Config } from './manager.js'
import { configSchema } from './config.schema.js'
import { startApp } from './manager.command.js'

async function bootstrap(): Promise<void> {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
  const db = databaseService.initDatabase(databaseConfig, logger)

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)
  const pubSub = redisService.initPubSub(redisOptions, logger)

  const queueConnection = queueService.getQueueConnection<Config>(config)

  const scheduler = schedulerService.initQueue(queueConnection, logger)

  await startApp(config, logger, db, redis, pubSub, scheduler)

  await schedulerService.closeQueue(scheduler, logger)
  await redisService.closePubSub(pubSub, logger)
  await redisService.closeRedis(redis, logger)
  await databaseService.closeDatabase(db, logger)

  process.exit(0)
}

bootstrap().catch((error) => {
  console.error(error)
  process.exit(1)
})
