import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import {
  databaseService,
  userService,
  planService,
  subscriptionService,
  categoryService
} from '@avito-speculant/database'
import { redisService, systemService } from '@avito-speculant/redis'
import {
  HeartbeatResult,
  HeartbeatJob,
  HeartbeatProcessor
} from '@avito-speculant/queue'
import { Config } from './worker-heartbeat.js'
import { configSchema } from './worker-heartbeat.schema.js'

export const heartbeatProcessor: HeartbeatProcessor = async (
  heartbeatJob: HeartbeatJob
) => {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
  const db = databaseService.initDatabase(databaseConfig, logger)

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)
  const pubSub = redisService.initPubSub(redisOptions, logger)

  await db.transaction().execute(async (trx) => {
    let step = heartbeatJob.data.step

    while (step !== 'commit') {
      switch (step) {
        case 'users': {
          console.log(`USERS`)
          const queueUsers = await userService.queueUsers(trx, {
            limit: 10
          })

          await heartbeatJob.updateData({
            step: 'plans'
          })
          step = 'plans'

          break
        }

        case 'plans': {
          console.log(`PLANS`)
          const queuePlans = await planService.queuePlans(trx, {
            limit: 2
          })

          await heartbeatJob.updateData({
            step: 'subscriptions'
          })
          step = 'subscriptions'

          break
        }

        case 'subscriptions': {
          console.log(`SUBSCRIPTIONS`)
          const queueSubscriptions = await subscriptionService.queueSubscriptions(
            trx,
            {
              limit: 10
            }
          )

          await heartbeatJob.updateData({
            step: 'categories'
          })
          step = 'categories'

          break
        }

        case 'categories': {
          console.log(`CATEGORIES`)
          const queueCategories = await categoryService.queueCategories(trx, {
            limit: 10
          })

          await heartbeatJob.updateData({
            step: 'commit'
          })
          step = 'commit'

          break
        }

        default: {
          throw new Error(`Unknown heartbeat step`)
        }
      }
    }
  })

  await databaseService.closeDatabase(db, logger)
  await redisService.closeRedis(redis, logger)
}
