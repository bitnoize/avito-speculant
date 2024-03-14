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
  TreatmentProcessor,
  queueService,
  scraperService,
  proxycheckService
} from '@avito-speculant/queue'
import { Config } from './worker-treatment.js'
import { configSchema } from './worker-treatment.schema.js'

const treatmentProcessor: TreatmentProcessor = async (treatmentJob) => {
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

  const { entityId } = treatmentJob.data

  switch (treatmentJob.name) {
    case 'user': {
      //
      // user
      //

      const { user, backLog } = await userService.consumeUser(db, {
        userId: entityId,
        data: {
          treatmentJobId: treatmentJob.id
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

      const { plan, backLog } = await planService.consumePlan(db, {
        planId: entityId,
        data: {
          treatmentJobId: treatmentJob.id
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

      const { subscription, backLog } = await subscriptionService.consumeSubscription(db, {
        subscriptionId: entityId,
        data: {
          treatmentJobId: treatmentJob.id
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

      const { category, subscription, backLog } = await categoryService.consumeCategory(db, {
        categoryId: entityId,
        data: {
          treatmentJobId: treatmentJob.id
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
          const scraperJobId = redisService.randomHash()

          await scraperCacheService.saveScraperCache(redis, {
            scraperJobId,
            avitoUrl: category.avitoUrl,
            intervalSec: subscription.intervalSec
          })

          await categoryCacheService.saveCategoryCache(redis, {
            categoryId: category.id,
            userId: category.userId,
            scraperJobId,
            avitoUrl: category.avitoUrl
          })
        }
      }

      await redisService.publishBackLog(pubSub, backLog)

      break
    }

    case 'proxy': {
      //
      // proxy
      //

      const { proxy, backLog } = await proxyService.consumeProxy(db, {
        proxyId: entityId,
        data: {
          treatmentJobId: treatmentJob.id
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
      throw new Error(`TreatmentJob unknown name '${treatmentJob.name}'`)
    }
  }

  logger.info({ name: treatmentJob.name, data: treatmentJob.data }, `TreatmentJob complete`)

  await proxycheckService.closeQueue(proxycheckQueue)
  await scraperService.closeQueue(scraperQueue)
  await redisService.closePubSub(pubSub)
  await redisService.closeRedis(redis)
  await databaseService.closeDatabase(db)
}

export default treatmentProcessor
