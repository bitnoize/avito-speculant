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
  userCacheService,
  planCacheService,
  subscriptionCacheService,
  categoryCacheService,
  scraperCacheService,
} from '@avito-speculant/redis'
import {
  BusinessResult,
  BusinessJob,
  BusinessProcessor,
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
      //
      // User Business Job
      //

      const businessUser = await userService.businessUser(db, {
        userId: businessJob.data.id,
        data: {
          businessJobId: businessJob.id
        }
      })

      logger.debug(businessUser)

      const { user, backLog } = businessUser

      if (user.status === 'paid') {
        const savedUserCache = await userCacheService.saveUserCache(redis, {
          userId: user.id,
          tgFromId: user.tgFromId,
          timeout: config.CACHE_BUSINESS_TIMEOUT
        })

        logger.debug(savedUserCache)
      } else {
        const droppedUserCache = await userCacheService.dropUserCache(redis, {
          userId: user.id
        })

        logger.debug(droppedUserCache)
      }

      await redisService.publish(pubSub, backLog)

      break
    }

    case 'plan': {
      //
      // Plan Business Job
      //

      const businessPlan = await planService.businessPlan(db, {
        planId: businessJob.data.id,
        data: {
          businessJobId: businessJob.id
        }
      })

      logger.debug(businessPlan)

      const { plan, backLog } = businessPlan

      if (plan.isEnabled) {
        const savedPlanCache = await planCacheService.savePlanCache(redis, {
          planId: plan.id,
          categoriesMax: plan.categoriesMax,
          priceRub: plan.priceRub,
          durationDays: plan.durationDays,
          intervalSec: plan.intervalSec,
          analyticsOn: plan.analyticsOn,
          timeout: config.CACHE_BUSINESS_TIMEOUT
        })

        logger.debug(savedPlanCache)
      } else {
        const droppedPlanCache = await planCacheService.dropPlanCache(redis, {
          planId: plan.id
        })

        logger.debug(droppedPlanCache)
      }

      await redisService.publish(pubSub, backLog)

      break
    }

    case 'subscription': {
      //
      // Subscription Business Job
      //

      const businessSubscription = await subscriptionService.businessSubscription(db, {
        subscriptionId: businessJob.data.id,
        data: {
          businessJobId: businessJob.id
        }
      })

      logger.debug(businessSubscription)

      const { subscription, backLog } = businessSubscription

      if (subscription.status === 'active') {
        const savedSubscriptionCache = await subscriptionCacheService.saveSubscriptionCache(redis, {
          subscriptionId: subscription.id,
          userId: subscription.userId,
          planId: subscription.planId,
          categoriesMax: subscription.categoriesMax,
          priceRub: subscription.priceRub,
          durationDays: subscription.durationDays,
          intervalSec: subscription.intervalSec,
          analyticsOn: subscription.analyticsOn,
          timeout: config.CACHE_BUSINESS_TIMEOUT
        })

        logger.debug(savedSubscriptionCache)
      } else {
        const droppedSubscriptionCache = await subscriptionCacheService.dropSubscriptionCache(redis, {
          subscriptionId: subscription.id,
          userId: subscription.userId,
          planId: subscription.planId
        })

        logger.debug(droppedSubscriptionCache)
      }

      await redisService.publish(pubSub, backLog)

      break
    }

    case 'category': {
      //
      // Category Business Job
      //

      const businessCategory = await categoryService.businessCategory(db, {
        categoryId: businessJob.data.id,
        data: {
          businessJobId: businessJob.id
        }
      })

      logger.debug(businessCategory)

      const { category, backLog } = businessCategory

      const findedScraperCache = await scraperCacheService.findScraperCache(redis, {
        avitoUrl: category.avitoUrl
      })

      logger.debug(findedScraperCache)

      const { scraperCache } = findedScraperCache

      if (scraperCache !== undefined) {
        if (category.isEnabled) {
          const savedCategoryCache = await categoryCacheService.saveCategoryCache(redis, {
            categoryId: category.id,
            userId: category.userId,
            avitoUrl: category.avitoUrl,
            scraperJobId: scraperCache.jobId,
            timeout: config.CACHE_BUSINESS_TIMEOUT
          })

          logger.debug(savedCategoryCache)
        } else {
          const droppedCategoryCache = await categoryCacheService.dropCategoryCache(redis, {
            categoryId: category.id,
            scraperJobId: scraperCache.jobId,
            timeout: config.CACHE_DROP_TIMEOUT
          })

          logger.debug(droppedCategoryCache)
        }
      } else {
        if (category.isEnabled) {
          const savedScraperCache = await scraperCacheService.saveScraperCache(redis, {
            avitoUrl: category.avitoUrl,
            intervalSec: category.intervalSec,
            timeout: config.CACHE_BUSINESS_TIMEOUT
          })

          logger.debug(savedScraperCache)

          const { scraperCache as newScraperCache } = savedScraperCache

          const savedCategoryCache = await categoryCacheService.saveCategoryCache(redis, {
            categoryId: category.id,
            userId: category.userId,
            avitoUrl: category.avitoUrl,
            scraperJobId: newScraperCache.jobId,
            timeout: config.CACHE_BUSINESS_TIMEOUT
          })

          logger.debug(savedCategoryCache)
        }
      }

      await redisService.publish(pubSub, backLog)

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
