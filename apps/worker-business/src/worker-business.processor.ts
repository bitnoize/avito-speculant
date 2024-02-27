import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import {
  databaseService,
  userService,
  planService,
  subscriptionService,
  categoryService
} from '@avito-speculant/database'
import {
  redisService,
  systemService,
  cacheService
} from '@avito-speculant/redis'
import {
  BusinessResult,
  BusinessJob,
  BusinessProcessor,
  queueService,
  scraperService
} from '@avito-speculant/queue'
import { CACHE_BUSINESS_TIMEOUT, Config } from './worker-business.js'
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

  const queueConnection = queueService.getQueueConnection<Config>(config)
  const scraperQueue = scraperService.initQueue(queueConnection, logger)

  switch (businessJob.name) {
    case 'user': {
      const user = await userService.businessUser(db, {
        userId: businessJob.data.id,
        data: {}
      })

      break
    }

    case 'plan': {
      const plan = await planService.businessPlan(db, {
        planId: businessJob.data.id,
        data: {}
      })

      break
    }

    case 'subscription': {
      const subscription = await subscriptionService.businessSubscription(
        db,
        {
          subscriptionId: businessJob.data.id,
          data: {}
        }
      )

      break
    }

    case 'category': {
      const category = await categoryService.businessCategory(db, {
        categoryId: businessJob.data.id,
        data: {}
      })

      const fetchedScraper = await cacheService.fetchScraper(redis, {
        avitoUrl: category.avitoUrl
      })

      if (fetchedScraper.jobId !== undefined) {
        if (category.isEnabled) {
          const appendedCategory = await cacheService.appendCategory(redis, {
            categoryId: category.id,
            scraperJobId: fetchedScraper.jobId
          })
        } else {
          const removedCategory = await cacheService.removeCategory(redis, {
            categoryId: category.id,
            scraperJobId
          })
        }
      } else {
        if (category.isEnabled) {
          const storedScraper = await cacheService.storeScraper(redis, {
            avitoUrl: category.avitoUrl
          })

          const appendedCategory = await cacheService.appendCategory(redis, {
            categoryId: category.id,
            scraperJobId: storedScraper.jobId
          })
        }
      }

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
