import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { DomainError } from '@avito-speculant/common'
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
  ProcessorUnknownNameError,
  UserSubscriptionLostError,
  TreatmentResult,
  TreatmentProcessor,
  queueService,
  proxycheckService,
  scrapingService,
  broadcastService,
} from '@avito-speculant/queue'
import {
  Config,
  NameProcess,
  NameProcessProxycheck,
  NameProcessScraping,
  NameProcessBroadcast,
} from './worker-treatment.js'
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

  const result: TreatmentResult = {}

  try {
    const name = treatmentJob.name

    switch (name) {
      case 'user': {
        const broadcastQueue = broadcastService.initQueue(queueConnection, logger)

        result[name] = await processUser(
          config,
          logger,
          db,
          redis,
          pubSub,
          treatmentJob,
          broadcastQueue
        )

        break
      }

      case 'plan': {
        result[name] = await processPlan(config, logger, db, redis, pubSub, treatmentJob)

        break
      }

      case 'subscription': {
        result[name] = await processSubscription(config, logger, db, redis, pubSub, treatmentJob)

        break
      }

      case 'category': {
        const scrapingQueue = scrapingService.initQueue(queueConnection, logger)

        result[name] = await processCategory(
          config,
          logger,
          db,
          redis,
          pubSub,
          treatmentJob,
          scrapingQueue
        )

        break
      }

      case 'proxy': {
        const proxycheckQueue = proxycheckService.initQueue(queueConnection, logger)

        result[name] = await processProxy(
          config,
          logger,
          db,
          redis,
          pubSub,
          treatmentJob,
          proxycheckQueue
        )

        break
      }

      default: {
        throw new ProcessorUnknownNameError({ name })
      }
    }
  } catch (error) {
    if (error instanceof DomainError) {
      if (error.isEmergency()) {
        // ...

        logger.fatal(`TreatmentWorker emergency shutdown`)
      }
    }

    throw error
  } finally {
    await redisService.closePubSub(pubSub)
    await redisService.closeRedis(redis)
    await databaseService.closeDatabase(db)
  }

  return result
}

const processUser: NameProcessBroadcast = async (
  config,
  logger,
  db,
  redis,
  pubSub,
  treatmentJob,
  broadcastQueue
) => {
  try {
    const startTime = Date.now()

    const { user, subscription, backLog } = await userService.consumeUser(db, {
      userId: treatmentJob.data.entityId,
      data: {
        queue: treatmentJob.queueName,
        job: {
          id: treatmentJob.id,
          name: treatmentJob.name,
          data: treatmentJob.data
        }
      }
    })

    if (user.isPaid) {
      if (subscription === undefined) {
        throw new UserSubscriptionLostError({ user })
      }

      await userCacheService.saveUserCache(redis, {
        userId: user.id,
        tgFromId: user.tgFromId,
        checkpoint: startTime + subscription.intervalSec * 1000
      })

      await broadcastService.addJob(broadcastQueue, user.id, 1000)
    } else {
      await broadcastService.removeJob(broadcastQueue, user.id, 1000)

      await userCacheService.dropUserCache(redis, {
        userId: user.id
      })
    }

    await redisService.publishBackLog(pubSub, backLog)

    return {
      entityId: user.id,
      durationTime: Date.now() - startTime
    }
  } catch (error) {
    if (error instanceof DomainError) {
      logger.error(`TreatmentProcessor processUser exception`)

      error.setEmergency()
    }

    throw error
  } finally {
    await broadcastService.closeQueue(broadcastQueue)
  }
}

const processPlan: NameProcess = async (config, logger, db, redis, pubSub, treatmentJob) => {
  try {
    const startTime = Date.now()

    const { plan, backLog } = await planService.consumePlan(db, {
      planId: treatmentJob.data.entityId,
      data: {
        queue: treatmentJob.queueName,
        job: {
          id: treatmentJob.id,
          name: treatmentJob.name,
          data: treatmentJob.data
        }
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

    return {
      entityId: plan.id,
      durationTime: Date.now() - startTime
    }
  } catch (error) {
    if (error instanceof DomainError) {
      logger.error(`TreatmentProcessor processPlan exception`)

      error.setEmergency()
    }

    throw error
  }
}

const processSubscription: NameProcess = async (config, logger, db, redis, pubSub, treatmentJob) => {
  try {
    const startTime = Date.now()

    const { subscription, backLog } = await subscriptionService.consumeSubscription(db, {
      subscriptionId: treatmentJob.data.entityId,
      data: {
        queue: treatmentJob.queueName,
        job: {
          id: treatmentJob.id,
          name: treatmentJob.name,
          data: treatmentJob.data
        }
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

    return {
      entityId: subscription.id,
      durationTime: Date.now() - startTime
    }
  } catch (error) {
    if (error instanceof DomainError) {
      logger.error(`TreatmentProcessor processSubscription exception`)

      error.setEmergency()
    }

    throw error
  }
}

const processCategory: NameProcessScraping = async (
  config,
  logger,
  db,
  redis,
  pubSub,
  treatmentJob,
  scrapingQueue
) => {
  try {
    const startTime = Date.now()

    const { category, subscription, backLog } = await categoryService.consumeCategory(db, {
      categoryId: treatmentJob.data.entityId,
      data: {
        queue: treatmentJob.queueName,
        job: {
          id: treatmentJob.id,
          name: treatmentJob.name,
          data: treatmentJob.data
        }
      }
    })

    const { scraperCache } = await scraperCacheService.fetchAvitoUrlScraperCache(redis, {
      avitoUrl: category.avitoUrl
    })

    if (category.isEnabled) {
      if (subscription === undefined) {
        throw new UserSubscriptionLostError({ category })
      }

      if (scraperCache !== undefined) {
        // Scraper allready exists
        // Save scraper and category
        // Ensure scraping job is running

        if (subscription.intervalSec < scraperCache.intervalSec) {
          // Category subscription interval is less then scraper interval
          // Scraper needs to be updated and restarted

          const removed = await scrapingService.removeJob(
            scrapingQueue,
            scraperCache.id,
            scraperCache.intervalSec
          )

          if (removed) {
            const logData = { scraperCache }
            logger.info(logData, `ScrapingJob removed on restart`)
          } else {
            const logData = { scraperCache }
            logger.warn(logData, `ScrapingJob not removed on restart`)
          }

          scraperCache.intervalSec = subscription.intervalSec
        }

        await categoryCacheService.saveScraperCategoryCache(redis, {
          categoryId: category.id,
          userId: category.userId,
          scraperId: scraperCache.id,
          avitoUrl: category.avitoUrl,
          intervalSec: scraperCache.intervalSec
        })

        await scrapingService.addJob(scrapingQueue, scraperCache.id, scraperCache.intervalSec)
      } else {
        // Scraper does not exists yet
        // Create new scraper and save it with category
        // Ensure scraping job is running

        const scraperId = redisService.randomHash()

        await categoryCacheService.saveScraperCategoryCache(redis, {
          categoryId: category.id,
          userId: category.userId,
          scraperId,
          avitoUrl: category.avitoUrl,
          intervalSec: subscription.intervalSec
        })

        await scrapingService.addJob(scrapingQueue, scraperId, subscription.intervalSec)
      }
    } else {
      if (scraperCache !== undefined) {
        // Scraper exists

        await categoryCacheService.dropCategoryCache(redis, {
          categoryId: category.id,
          userId: category.userId,
          scraperId: scraperCache.id
        })

        const { categoriesCache } = await categoryCacheService.fetchScraperCategoriesCache(redis, {
          scraperId: scraperCache.id
        })

        if (categoriesCache.length === 0) {
          // Scraper has only this one category
          // Ensure scrapingJob is stopped
          // Drop scraperCache and categoryCache

          const removed = await scrapingService.removeJob(
            scrapingQueue,
            scraperCache.id,
            scraperCache.intervalSec
          )

          if (removed) {
            const logData = { scraperCache }
            logger.info(logData, `ScrapingJob removed on empty`)
          } else {
            const logData = { scraperCache }
            logger.warn(logData, `ScrapingJob not removed on empty`)
          }

          await scraperCacheService.dropScraperCache(redis, {
            scraperId: scraperCache.id,
            avitoUrl: scraperCache.avitoUrl
          })
        }
      }
    }

    await redisService.publishBackLog(pubSub, backLog)

    return {
      entityId: category.id,
      durationTime: Date.now() - startTime
    }
  } catch (error) {
    if (error instanceof DomainError) {
      logger.error(`TreatmentProcessor processCategory exception`)

      error.setEmergency()
    }

    throw error
  } finally {
    await scrapingService.closeQueue(scrapingQueue)
  }
}

const processProxy: NameProcessProxycheck = async (
  config,
  logger,
  db,
  redis,
  pubSub,
  treatmentJob,
  proxycheckQueue
) => {
  try {
    const startTime = Date.now()

    const { proxy, backLog } = await proxyService.consumeProxy(db, {
      proxyId: treatmentJob.data.entityId,
      data: {
        queue: treatmentJob.queueName,
        job: {
          id: treatmentJob.id,
          name: treatmentJob.name,
          data: treatmentJob.data
        }
      }
    })

    if (proxy.isEnabled) {
      await proxyCacheService.saveProxyCache(redis, {
        proxyId: proxy.id,
        proxyUrl: proxy.proxyUrl
      })

      await proxycheckService.addJob(proxycheckQueue, proxy.id)
    } else {
      await proxyCacheService.dropProxyCache(redis, {
        proxyId: proxy.id
      })
    }

    await redisService.publishBackLog(pubSub, backLog)

    return {
      entityId: proxy.id,
      durationTime: Date.now() - startTime
    }
  } catch (error) {
    if (error instanceof DomainError) {
      logger.error(`TreatmentProcessor processProxy exception`)

      error.setEmergency()
    }

    throw error
  } finally {
    await proxycheckService.closeQueue(proxycheckQueue)
  }
}

export default treatmentProcessor



/*
    if (scraperCache !== undefined) {
      if (category.isEnabled) {
        await categoryCacheService.saveCategoryCache(redis, {
          categoryId: category.id,
          userId: category.userId,
          scraperId: scraperCache.id,
          avitoUrl: category.avitoUrl
        })
      } else {
        await categoryCacheService.dropCategoryCache(redis, {
          categoryId: category.id,
          userId: category.userId,
          scraperId: scraperCache.id
        })
      }
    } else {
      if (category.isEnabled && subscription !== undefined) {
        const scraperId = redisService.randomHash()

        await scraperCacheService.saveScraperCache(redis, {
          scraperId,
          avitoUrl: category.avitoUrl,
          intervalSec: subscription.intervalSec
        })

        await categoryCacheService.saveCategoryCache(redis, {
          categoryId: category.id,
          userId: category.userId,
          scraperId,
          avitoUrl: category.avitoUrl
        })
      }
    }
*/
