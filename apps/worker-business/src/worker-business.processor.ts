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
  BusinessProcessor,
  queueService,
  scraperService,
  proxycheckService
} from '@avito-speculant/queue'
import { Config } from './worker-business.js'
import { configSchema } from './worker-business.schema.js'

const businessProcessor: BusinessProcessor = async (businessJob) => {
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

      const { user, backLog } = await userService.businessUser(db, {
        userId: businessJob.data.id,
        data: {
          businessJobId: businessJob.id
        }
      })

      if (user.status === 'paid') {
        await userCacheService.saveUserCache(redis, {
          userId: user.id,
          tgFromId: user.tgFromId
        })
      } else {
        await userCacheService.dropUserCache(redis, {
          userId: user.id
        })
      }

      await redisService.publishBackLog(pubSub, backLog)

      break
    }

    case 'plan': {
      //
      // plan
      //

      const { plan, backLog } = await planService.businessPlan(db, {
        planId: businessJob.data.id,
        data: {
          businessJobId: businessJob.id
        }
      })

      if (plan.isEnabled) {
        await planCacheService.savePlanCache(redis, {
          planId: plan.id,
          categoriesMax: plan.categoriesMax,
          priceRub: plan.priceRub,
          durationDays: plan.durationDays,
          intervalSec: plan.intervalSec,
          analyticsOn: plan.analyticsOn
        })
      } else {
        await planCacheService.dropPlanCache(redis, {
          planId: plan.id
        })
      }

      await redisService.publishBackLog(pubSub, backLog)

      break
    }

    case 'subscription': {
      //
      // subscription
      //

      const { subscription, backLog } = await subscriptionService.businessSubscription(db, {
        subscriptionId: businessJob.data.id,
        data: {
          businessJobId: businessJob.id
        }
      })

      if (subscription.status === 'active') {
        await subscriptionCacheService.saveSubscriptionCache(redis, {
          subscriptionId: subscription.id,
          userId: subscription.userId,
          planId: subscription.planId,
          categoriesMax: subscription.categoriesMax,
          priceRub: subscription.priceRub,
          durationDays: subscription.durationDays,
          intervalSec: subscription.intervalSec,
          analyticsOn: subscription.analyticsOn
        })
      } else {
        await subscriptionCacheService.dropSubscriptionCache(redis, {
          subscriptionId: subscription.id,
          userId: subscription.userId,
          planId: subscription.planId
        })
      }

      await redisService.publishBackLog(pubSub, backLog)

      break
    }

    case 'category': {
      //
      // category
      //

      const { category, subscription, backLog } = await categoryService.businessCategory(db, {
        categoryId: businessJob.data.id,
        data: {
          businessJobId: businessJob.id
        }
      })

      const { scraperCache } = await scraperCacheService.findScraperCache(redis, {
        avitoUrl: category.avitoUrl
      })

      if (scraperCache !== undefined) {
        // ScraperCache allready exists

        if (category.isEnabled) {
          await categoryCacheService.saveCategoryCache(redis, {
            categoryId: category.id,
            userId: category.userId,
            scraperJobId: scraperCache.jobId,
            avitoUrl: category.avitoUrl
          })
        } else {
          await categoryCacheService.dropCategoryCache(redis, {
            categoryId: category.id,
            userId: category.userId,
            scraperJobId: scraperCache.jobId
          })
        }
      } else {
        // ScraperCache not exists yet

        if (category.isEnabled && subscription !== undefined) {
          console.log(`TEST_MARK_001`)

          const scraperJobId = redisService.randomHash()

          console.log(`TEST_MARK_002`)
          await scraperCacheService.saveScraperCache(redis, {
            scraperJobId,
            avitoUrl: category.avitoUrl,
            intervalSec: subscription.intervalSec
          })

          console.log(`TEST_MARK_003`)

          await categoryCacheService.saveCategoryCache(redis, {
            categoryId: category.id,
            userId: category.userId,
            scraperJobId,
            avitoUrl: category.avitoUrl
          })

          console.log(`TEST_MARK_004`)
        }
      }

      await redisService.publishBackLog(pubSub, backLog)

      break
    }

    case 'proxy': {
      //
      // proxy
      //

      const { proxy, backLog } = await proxyService.businessProxy(db, {
        proxyId: businessJob.data.id,
        data: {
          businessJobId: businessJob.id
        }
      })

      if (proxy.isEnabled) {
        await proxyCacheService.saveProxyCache(redis, {
          proxyId: proxy.id,
          proxyUrl: proxy.proxyUrl
        })

        await proxycheckService.addJob(proxycheckQueue, 'default', proxy.id)
      } else {
        await proxyCacheService.dropProxyCache(redis, {
          proxyId: proxy.id
        })
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
