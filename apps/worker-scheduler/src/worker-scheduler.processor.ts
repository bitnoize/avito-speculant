import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import {
  databaseService,
  userService,
  planService,
  subscriptionService,
  categoryService
} from '@avito-speculant/database'
import { redisService } from '@avito-speculant/redis'
import { Job, SchedulerJob, SchedulerProcessor } from '@avito-speculant/queue'
import { Config } from './worker-scheduler.js'
import { configSchema } from './config.schema.js'

export const schedulerProcessor: SchedulerProcessor = async (job: SchedulerJob) => {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
  const db = databaseService.initDatabase(databaseConfig, logger)

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)
  const pubSub = redisService.initPubSub(redisOptions, logger)

  await db.transaction().execute(async (trx) => {
    await job.updateProgress(10)

    const scheduleUsers = await userService.scheduleUsers(trx, {
      limit: 100,
      data: {}
    })

    await job.updateProgress(20)

    const schedulePlans = await planService.schedulePlans(trx, {
      limit: 2,
      data: {}
    })

    await job.updateProgress(30)

    const scheduleSubscriptions = await subscriptionService.scheduleSubscriptions(
      trx,
      {
        limit: 100,
        data: {}
      }
    )

    await job.updateProgress(40)

    await redisService.publishBackLog(pubSub, logger, scheduleUsers.backLog)
    await redisService.publishBackLog(pubSub, logger, schedulePlans.backLog)
    await redisService.publishBackLog(pubSub, logger, scheduleSubscriptions.backLog)
  })

  await databaseService.closeDatabase(db, logger)
  await redisService.closeRedis(redis, logger)

  return {
    counter: 0
  }
}
