import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import {
  databaseService,
  userService,
  planService,
  subscriptionService,
  botService,
  categoryService,
  proxyService
} from '@avito-speculant/database'
import {
  redisService,
  userCacheService,
  planCacheService,
  subscriptionCacheService,
  botCacheService,
  categoryCacheService,
  proxyCacheService,
  scraperCacheService
} from '@avito-speculant/redis'
import {
  ConsumeWrongResponseError,
  TreatmentResult,
  TreatmentProcessor,
  queueService,
  broadcastService,
  scrapingService,
  checkproxyService,
} from '@avito-speculant/queue'
import { Config, ProcessName } from './worker-treatment.js'
import { configSchema } from './worker-treatment.schema.js'

const treatmentProcessor: TreatmentProcessor = async function (treatmentJob) {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const treatmentResult: TreatmentResult = {
    durationTime: 0
  }

  const name = treatmentJob.name

  switch (name) {
    case 'user': {
      await processUser(config, logger, treatmentJob, treatmentResult)

      break
    }

    case 'plan': {
      await processPlan(config, logger, treatmentJob, treatmentResult)

      break
    }

    case 'subscription': {
      await processSubscription(config, logger, treatmentJob, treatmentResult)

      break
    }

    case 'bot': {
      await processBot(config, logger, treatmentJob, treatmentResult)

      break
    }

    case 'category': {
      await processCategory(config, logger, treatmentJob, treatmentResult)

      break
    }

    case 'proxy': {
      await processProxy(config, logger, treatmentJob, treatmentResult)

      break
    }

    default: {
      throw new Error(`Processor name '${name}' unknown`)
    }
  }

  return treatmentResult
}

const processUser: ProcessName = async function (
  config,
  logger,
  treatmentJob,
  treatmentResult
) {
  const startTime = Date.now()

  const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
  const db = databaseService.initDatabase(databaseConfig, logger)

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)
  const pubSub = redisService.initPubSub(redisOptions, logger)

  const { entityId } = treatmentJob.data

  try {
    const { user, backLog } = await userService.consumeUser(db, {
      entityId,
      data: {}
    })

    await userCacheService.savePaidUserCache(redis, {
      userId: user.id,
      tgFromId: user.tgFromId,
      isPaid: user.isPaid,
      subscriptions: user.subscriptions,
      categories: user.categories,
      bots: user.bots,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      queuedAt: user.queuedAt,
    })

    await redisService.publishBackLog(pubSub, backLog)
  } finally {
    await redisService.closePubSub(pubSub)
    await redisService.closeRedis(redis)
    await databaseService.closeDatabase(db)

    treatmentResult.durationTime = Date.now() - startTime
  }
}

const processPlan: ProcessName = async function (
  config,
  logger,
  treatmentJob,
  treatmentResult
) {
  const startTime = Date.now()

  const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
  const db = databaseService.initDatabase(databaseConfig, logger)

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)
  const pubSub = redisService.initPubSub(redisOptions, logger)

  const { entityId } = treatmentJob.data

  try {
    const { plan, backLog } = await planService.consumePlan(db, {
      entityId,
      data: {}
    })

    await planCacheService.savePlanCache(redis, {
      planId: plan.id,
      categoriesMax: plan.categoriesMax,
      durationDays: plan.durationDays,
      intervalSec: plan.intervalSec,
      analyticsOn: plan.analyticsOn,
      priceRub: plan.priceRub,
      isEnabled: plan.isEnabled,
      subscriptions: plan.subscriptions,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
      queuedAt: plan.queuedAt
    })

    await redisService.publishBackLog(pubSub, backLog)
  } finally {
    await redisService.closePubSub(pubSub)
    await redisService.closeRedis(redis)
    await databaseService.closeDatabase(db)

    treatmentResult.durationTime = Date.now() - startTime
  }
}

const processSubscription: ProcessName = async function (
  config,
  logger,
  treatmentJob,
  treatmentResult
) {
  const startTime = Date.now()

  const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
  const db = databaseService.initDatabase(databaseConfig, logger)

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)
  const pubSub = redisService.initPubSub(redisOptions, logger)

  const { entityId } = treatmentJob.data

  try {
    const { subscription, backLog } = await subscriptionService.consumeSubscription(db, {
      entityId,
      data: {}
    })

    await userCacheService.saveActiveSubscriptionCache(redis, {
      subscriptionId: subscription.id,
      userId: subscription.userId,
      planId: subscription.planId,
      priceRub: subscription.priceRub,
      status: subscription.status,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
      queuedAt: subscription.queuedAt,
      timeoutAt: subscription.timeoutAt,
      finishedAt: subscription.finishedAt
    })

    await redisService.publishBackLog(pubSub, backLog)
  } finally {
    await redisService.closePubSub(pubSub)
    await redisService.closeRedis(redis)
    await databaseService.closeDatabase(db)

    treatmentResult.durationTime = Date.now() - startTime
  }
}

const processBot: ProcessName = async function (
  config,
  logger,
  treatmentJob,
  treatmentResult,
) {
  const startTime = Date.now()

  const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
  const db = databaseService.initDatabase(databaseConfig, logger)

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)
  const pubSub = redisService.initPubSub(redisOptions, logger)

  const queueConnection = queueService.getQueueConnection<Config>(config)
  const checkbotQueue = checkbotService.initQueue(queueConnection, logger)

  const { entityId } = treatmentJob.data

  try {
    const { bot } = await botService.consumeBot(db, {
      entityId,
      data: {}
    })

    await botCacheService.saveLinkedBotCache(redis, {
      botId: bot.id,
      token: bot.token,
      isLinked: bot.isLinked,
      isEnabled: bot.isEnabled,
      createdAt: bot.createdAt,
      updatedAt: bot.updatedAt,
      queuedAt: bot.queuedAt,
    })

    if (bot.isEnabled) {
      await checkbotService.addJob(checkbotQueue, bot.id)
    }

    await redisService.publishBackLog(pubSub, backLog)
  } finally {
    await checkbotService.closeQueue(checkbotQueue)
    await redisService.closePubSub(pubSub)
    await redisService.closeRedis(redis)
    await databaseService.closeDatabase(db)

    treatmentResult.durationTime = Date.now() - startTime
  }
}

const processCategory: ProcessName = async function (
  config,
  logger,
  treatmentJob,
  treatmentResult
) {
  const startTime = Date.now()

  const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
  const db = databaseService.initDatabase(databaseConfig, logger)

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)
  const pubSub = redisService.initPubSub(redisOptions, logger)

  const queueConnection = queueService.getQueueConnection<Config>(config)
  const broadcastQueue = broadcastService.initQueue(queueConnection, logger)
  const scrapingQueue = scrapingService.initQueue(queueConnection, logger)

  const { entityId } = treatmentJob.data

  try {
    const { category, backLog } = await categoryService.consumeCategory(db, {
      entityId,
      data: {}
    })

    const scraperId = await scraperCacheService.fetchUrlPathScraperId(redis, {
      urlPath: category.urlPath
    })

    if (category.isEnabled) {
      if (category.bot_id === null) {
        throw new ConsumeWrongResponseError({ category, user })
      }

      if (!user.isPaid) {
        throw new ConsumeWrongResponseError({ category, user })
      }

      if (subscription === undefined) {
        throw new ConsumeWrongResponseError({ category, user })
      }

      if (plan === undefined) {
        throw new ConsumeWrongResponseError({ category, user })
      }

      if (bot === undefined) {
        throw new ConsumeWrongResponseError({ category, user })
      }

      if (scraperId !== undefined) {
        const { scraperCache } = await scraperCacheService.fetchScraperCache(redis, {
          urlPath: category.urlPath
        })

        await categoryCacheService.saveEnabledCategoryCache(redis, {
          categoryId: category.id,
          userId: category.userId,
          urlPath: category.urlPath,
          scraperId: scraperCache.id,
        })
      } else {
        const scraperId = redisService.randomHash()

        await categoryCacheService.saveEnabledCategoryCache(redis, {
          categoryId: category,
          userId: category.userId,
          urlPath: category.urlPath,
          scraperId: scraperId,
        })
      }

      await scrapingService.addRepeatableJob(
        scrapingQueue,
        scraperCache.id,
        scraperCache.intervalSec
      )
    } else {
      if (category.bot_id !== null) {
        throw new ConsumeWrongResponseError({ category, user })
      }

      if (subscription !== undefined) {
        throw new ConsumeWrongResponseError({ category, user, subscription })
      }

      if (plan !== undefined) {
        throw new ConsumeWrongResponseError({ category, user, plan })
      }

      if (bot !== undefined) {
        throw new ConsumeWrongResponseError({ category, user, bot })
      }


    }

    await redisService.publishBackLog(pubSub, backLog)
  } finally {
    await scrapingService.closeQueue(scrapingQueue)
    await broadcastService.closeQueue(broadcastQueue)
    await redisService.closePubSub(pubSub)
    await redisService.closeRedis(redis)
    await databaseService.closeDatabase(db)

    treatmentResult.durationTime = Date.now() - startTime
  }
}

const processProxy: ProcessName = async function (
  config,
  logger,
  treatmentJob,
  treatmentResult,
) {
  const startTime = Date.now()

  const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
  const db = databaseService.initDatabase(databaseConfig, logger)

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)
  const pubSub = redisService.initPubSub(redisOptions, logger)

  const queueConnection = queueService.getQueueConnection<Config>(config)
  const checkproxyQueue = checkproxyService.initQueue(queueConnection, logger)

  const { entityId } = treatmentJob.data

  try {
    const { proxy, backLog } = await proxyService.consumeProxy(db, {
      proxyId: entityId,
      data: {}
    })

    await proxyCacheService.saveProxyCache(redis, {
      proxyId: proxy.id,
      url: proxy.url,
      isEnabled: proxy.isEnabled,
      createdAt: proxy.createdAt,
      updatedAt: proxy.updatedAt,
      queuedAt: proxy.queuedAt
    })

    if (proxy.isEnabled) {
      await checkproxyService.addJob(checkproxyQueue, proxy.id)
    }

    await redisService.publishBackLog(pubSub, backLog)
  } finally {
    await checkproxyService.closeQueue(checkproxyQueue)
    await redisService.closePubSub(pubSub)
    await redisService.closeRedis(redis)
    await databaseService.closeDatabase(db)

    treatmentResult.durationTime = Date.now() - startTime
  }
}

export default treatmentProcessor

/*

      await broadcastService.addRepeatableJob(broadcastQueue, user.id)
      await broadcastService.removeRepeatableJob(broadcastQueue, user.id)



    if (category.isEnabled) {
      if (subscription === undefined || plan === undefined) {
        throw new ConsumeWrongParamsError({ category, user })
      }

      if (scraperCache !== undefined) {
        // Scraper allready exists
        // Save scraper and category
        // Ensure scraping job is running

        if (plan.intervalSec < scraperCache.intervalSec) {
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

*/
