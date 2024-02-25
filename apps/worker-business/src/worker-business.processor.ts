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
  BusinessResult,
  BusinessJob,
  BusinessProcessor
} from '@avito-speculant/queue'
import { Config } from './worker-business.js'
import { configSchema } from './worker-business.schema.js'

const businessProcessor: BusinessProcessor = async (businessJob: BusinessJob) => {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
  const db = databaseService.initDatabase(databaseConfig, logger)

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)
  const pubSub = redisService.initPubSub(redisOptions, logger)

  switch (businessJob.name) {
    case 'user': {
      const businessUser = await userService.businessUser(db, {
        userId: businessJob.data.id,
        data: {}
      })

      break
    }

    case 'plan': {
      const businessPlan = await planService.businessPlan(db, {
        planId: businessJob.data.id,
        data: {}
      })

      break
    }

    case 'subscription': {
      const businessSubscription = await subscriptionService.businessSubscription(
        db,
        {
          subscriptionId: businessJob.data.id,
          data: {}
        }
      )

      break
    }

    case 'category': {
      const businessCategory = await categoryService.businessCategory(db, {
        categoryId: businessJob.data.id,
        data: {}
      })

      break
    }

    default: {
      throw new Error(`BusinessJob unknown name`)
    }
  }

  await pubSub.disconnect()
  await redis.disconnect()
  await db.destroy()
}

export default businessProcessor
