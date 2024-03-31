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
  TreatmentResult,
  TreatmentProcessor,
  queueService,
  proxycheckService
} from '@avito-speculant/queue'
import { Config, Process, ProcessProxycheck } from './worker-treatment.js'
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
        result[name] = await processUser(config, logger, db, redis, pubSub, treatmentJob)

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
        result[name] = await processCategory(config, logger, db, redis, pubSub, treatmentJob)

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

const processUser: Process = async (config, logger, db, redis, pubSub, treatmentJob) => {
  try {
    const { user, backLog } = await userService.consumeUser(db, {
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

    return { entityId: user.id }
  } catch (error) {
    if (error instanceof DomainError) {
      logger.error(`TreatmentProcessor processUser exception`)

      error.setEmergency()
    }

    throw error
  }
}

const processPlan: Process = async (config, logger, db, redis, pubSub, treatmentJob) => {
  try {
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

    return { entityId: plan.id }
  } catch (error) {
    if (error instanceof DomainError) {
      logger.error(`TreatmentProcessor processPlan exception`)

      error.setEmergency()
    }

    throw error
  }
}

const processSubscription: Process = async (config, logger, db, redis, pubSub, treatmentJob) => {
  try {
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

    return { entityId: subscription.id }
  } catch (error) {
    if (error instanceof DomainError) {
      logger.error(`TreatmentProcessor processSubscription exception`)

      error.setEmergency()
    }

    throw error
  }
}

const processCategory: Process = async (config, logger, db, redis, pubSub, treatmentJob) => {
  try {
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

    const { scraperCache } = await scraperCacheService.findScraperCache(redis, {
      avitoUrl: category.avitoUrl
    })

    if (scraperCache !== undefined) {
      // ScraperCache allready exists

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
      // ScraperCache not exists yet

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

    await redisService.publishBackLog(pubSub, backLog)

    return { entityId: category.id }
  } catch (error) {
    if (error instanceof DomainError) {
      logger.error(`TreatmentProcessor processCategory exception`)

      error.setEmergency()
    }

    throw error
  }
}

const processProxy: ProcessProxycheck = async (
  config,
  logger,
  db,
  redis,
  pubSub,
  treatmentJob,
  proxycheckQueue
) => {
  try {
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

      await proxycheckService.addJob(proxycheckQueue, 'simple', proxy.id)
    } else {
      await proxyCacheService.dropProxyCache(redis, {
        proxyId: proxy.id
      })
    }

    await redisService.publishBackLog(pubSub, backLog)

    return { entityId: proxy.id }
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
