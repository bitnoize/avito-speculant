import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import {
  databaseService,
  userService,
  planService,
  subscriptionService,
  categoryService,
  proxyService
} from '@avito-speculant/database'
import {
  redisService,
  systemService,
  userCacheService,
  planCacheService,
  subscriptionCacheService,
  categoryCacheService,
  proxyCacheService,
  scraperCacheService
} from '@avito-speculant/redis'
import {
  BusinessResult,
  BusinessJob,
  BusinessProcessor,
  queueService,
  scraperService,
  proxycheckService,
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

  const queueConnection = queueService.getQueueConnection<Config>(config)
  const scraperQueue = scraperService.initQueue(queueConnection, logger)
  const proxycheckQueue = proxycheckService.initQueue(queueConnection, logger)

  switch (businessJob.name) {
    case 'user': {
      //
      // user
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
          tgFromId: user.tgFromId
        })
        logger.debug(savedUserCache)
      } else {
        const droppedUserCache = await userCacheService.dropUserCache(redis, {
          userId: user.id
        })
        logger.debug(droppedUserCache)
      }

      await redisService.publishBackLog(pubSub, backLog)

      break
    }

    case 'plan': {
      //
      // plan
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
          analyticsOn: plan.analyticsOn
        })
        logger.debug(savedPlanCache)
      } else {
        const droppedPlanCache = await planCacheService.dropPlanCache(redis, {
          planId: plan.id
        })
        logger.debug(droppedPlanCache)
      }

      await redisService.publishBackLog(pubSub, backLog)

      break
    }

    case 'subscription': {
      //
      // subscription
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
          analyticsOn: subscription.analyticsOn
        })
        logger.debug(savedSubscriptionCache)
      } else {
        const droppedSubscriptionCache = await subscriptionCacheService.dropSubscriptionCache(
          redis,
          {
            subscriptionId: subscription.id,
            userId: subscription.userId,
            planId: subscription.planId
          }
        )
        logger.debug(droppedSubscriptionCache)
      }

      await redisService.publishBackLog(pubSub, backLog)

      break
    }

    case 'category': {
      //
      // category
      //

      const businessCategory = await categoryService.businessCategory(db, {
        categoryId: businessJob.data.id,
        data: {
          businessJobId: businessJob.id
        }
      })
      logger.debug(businessCategory)

      const { category, subscription, backLog } = businessCategory

      const findedScraperCache = await scraperCacheService.findScraperCache(redis, {
        avitoUrl: category.avitoUrl
      })
      logger.debug(findedScraperCache)

      const { scraperCache } = findedScraperCache

      if (scraperCache !== undefined) {
        // ScraperCache allready exists

        if (category.isEnabled) {
          const savedCategoryCache = await categoryCacheService.saveCategoryCache(redis, {
            categoryId: category.id,
            userId: category.userId,
            scraperJobId: scraperCache.jobId,
            avitoUrl: category.avitoUrl
          })
          logger.debug(savedCategoryCache)
        } else {
          const droppedCategoryCache = await categoryCacheService.dropCategoryCache(redis, {
            categoryId: category.id,
            userId: category.userId,
            scraperJobId: scraperCache.jobId
          })
          logger.debug(droppedCategoryCache)
        }
      } else {
        // ScraperCache not exists yet

        if (category.isEnabled && subscription !== undefined) {
          const scraperJobId = redisService.randomHash()

          const savedScraperCache = await scraperCacheService.saveScraperCache(redis, {
            scraperJobId,
            avitoUrl: category.avitoUrl,
            intervalSec: subscription.intervalSec
          })
          logger.debug(savedScraperCache)

          const savedCategoryCache = await categoryCacheService.saveCategoryCache(redis, {
            categoryId: category.id,
            userId: category.userId,
            scraperJobId,
            avitoUrl: category.avitoUrl
          })
          logger.debug(savedCategoryCache)
        }
      }

      await redisService.publishBackLog(pubSub, backLog)

      break
    }

    case 'proxy': {
      //
      // proxy
      //

      const businessProxy = await proxyService.businessProxy(db, {
        proxyId: businessJob.data.id,
        data: {
          businessJobId: businessJob.id
        }
      })
      logger.debug(businessProxy)

      const { proxy, backLog } = businessProxy

      if (proxy.isEnabled) {
        const savedProxyCache = await proxyCacheService.saveProxyCache(redis, {
          proxyId: proxy.id,
          proxyUrl: proxy.proxyUrl,
          isOnline: proxy.isOnline
        })
        logger.debug(savedProxyCache)

        await proxycheckService.addJob(proxycheckQueue, 'default', proxy.id)
      } else {
        const droppedProxyCache = await proxyCacheService.dropProxyCache(redis, {
          proxyId: proxy.id
        })
        logger.debug(droppedProxyCache)
      }

      await redisService.publishBackLog(pubSub, backLog)

      break
    }

    default: {
      throw new Error(`BusinessJob unknown name '${businessJob.name}'`)
    }
  }

  logger.info({ name: businessJob.name, data: businessJob.data }, `BusinessJob complete`)

  await scraperService.closeQueue(scraperQueue)
  await redisService.closePubSub(pubSub)
  await redisService.closeRedis(redis)
  await databaseService.closeDatabase(db)
}

export default businessProcessor
