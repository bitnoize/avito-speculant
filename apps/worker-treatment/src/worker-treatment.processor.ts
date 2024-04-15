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
  UserSubscriptionBreakError,
  TreatmentResult,
  TreatmentProcessor,
  queueService,
  proxycheckService,
  scrapingService,
  broadcastService
} from '@avito-speculant/queue'
import {
  Config,
  NameProcess,
  NameProcessProxycheck,
  NameProcessScraping,
  NameProcessBroadcast
} from './worker-treatment.js'
import { configSchema } from './worker-treatment.schema.js'

const treatmentProcessor: TreatmentProcessor = async function (treatmentJob) {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
  const db = databaseService.initDatabase(databaseConfig, logger)

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)
  const pubSub = redisService.initPubSub(redisOptions, logger)

  const queueConnection = queueService.getQueueConnection<Config>(config)

  const treatmentResult: TreatmentResult = {}

  try {
    const name = treatmentJob.name

    switch (name) {
      case 'user': {
        const broadcastQueue = broadcastService.initQueue(queueConnection, logger)

        await processUser(
          config,
          logger,
          db,
          redis,
          pubSub,
          treatmentJob,
          treatmentResult,
          broadcastQueue
        )

        break
      }

      case 'plan': {
        await processPlan(config, logger, db, redis, pubSub, treatmentJob, treatmentResult)

        break
      }

      case 'subscription': {
        await processSubscription(config, logger, db, redis, pubSub, treatmentJob, treatmentResult)

        break
      }

      case 'category': {
        const scrapingQueue = scrapingService.initQueue(queueConnection, logger)

        await processCategory(
          config,
          logger,
          db,
          redis,
          pubSub,
          treatmentJob,
          treatmentResult,
          scrapingQueue
        )

        break
      }

      case 'proxy': {
        const proxycheckQueue = proxycheckService.initQueue(queueConnection, logger)

        await processProxy(
          config,
          logger,
          db,
          redis,
          pubSub,
          treatmentJob,
          treatmentResult,
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

  return treatmentResult
}

const processUser: NameProcessBroadcast = async function (
  config,
  logger,
  db,
  redis,
  pubSub,
  treatmentJob,
  treatmentResult,
  broadcastQueue
) {
  try {
    const startTime = Date.now()
    const name = treatmentJob.name

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
        throw new UserSubscriptionBreakError({ user })
      }

      await userCacheService.saveUserCache(redis, {
        userId: user.id,
        tgFromId: user.tgFromId,
        checkpointAt: startTime + subscription.intervalSec * 1000
      })

      await broadcastService.addRepeatableJob(broadcastQueue, user.id)
    } else {
      await broadcastService.removeRepeatableJob(broadcastQueue, user.id)

      await userCacheService.dropUserCache(redis, {
        userId: user.id
      })
    }

    await redisService.publishBackLog(pubSub, backLog)

    treatmentResult[name] = {
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

const processPlan: NameProcess = async function (
  config,
  logger,
  db,
  redis,
  pubSub,
  treatmentJob,
  treatmentResult
) {
  try {
    const startTime = Date.now()
    const name = treatmentJob.name

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

    treatmentResult[name] = {
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

const processSubscription: NameProcess = async function (
  config,
  logger,
  db,
  redis,
  pubSub,
  treatmentJob,
  treatmentResult
) {
  try {
    const startTime = Date.now()
    const name = treatmentJob.name

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

    treatmentResult[name] = {
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

const processCategory: NameProcessScraping = async function (
  config,
  logger,
  db,
  redis,
  pubSub,
  treatmentJob,
  treatmentResult,
  scrapingQueue
) {
  try {
    const startTime = Date.now()
    const name = treatmentJob.name

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
        throw new UserSubscriptionBreakError({ category })
      }

      if (scraperCache !== undefined) {
        // Scraper allready exists
        // Save scraper and category
        // Ensure scraping job is running

        if (subscription.intervalSec < scraperCache.intervalSec) {
          // Category subscription interval is less then scraper interval
          // Scraper needs to be updated and restarted

          const removed = await scrapingService.removeRepeatableJob(
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

        await scrapingService.addRepeatableJob(
          scrapingQueue,
          scraperCache.id,
          scraperCache.intervalSec
        )
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

        await scrapingService.addRepeatableJob(scrapingQueue, scraperId, subscription.intervalSec)
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

          const removed = await scrapingService.removeRepeatableJob(
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

    treatmentResult[name] = {
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

const processProxy: NameProcessProxycheck = async function (
  config,
  logger,
  db,
  redis,
  pubSub,
  treatmentJob,
  treatmentResult,
  proxycheckQueue
) {
  try {
    const startTime = Date.now()
    const name = treatmentJob.name

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

    treatmentResult[name] = {
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
