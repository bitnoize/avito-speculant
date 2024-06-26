import * as crypto from 'crypto'
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
  TreatmentResult,
  TreatmentProcessor,
  queueService,
  broadcastService,
  scrapingService,
  checkproxyService,
  checkbotService
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

const processUser: ProcessName = async function (config, logger, treatmentJob, treatmentResult) {
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

    await userCacheService.saveUserCache(redis, {
      userId: user.id,
      tgFromId: user.tgFromId,
      activeSubscriptionId: user.activeSubscriptionId,
      subscriptions: user.subscriptions,
      categories: user.categories,
      bots: user.bots,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      queuedAt: user.queuedAt
    })

    await redisService.publishBackLog(pubSub, backLog)
  } finally {
    await redisService.closePubSub(pubSub)
    await redisService.closeRedis(redis)

    await databaseService.closeDatabase(db)

    treatmentResult.durationTime = Date.now() - startTime
  }
}

const processPlan: ProcessName = async function (config, logger, treatmentJob, treatmentResult) {
  const startTime = Date.now()

  const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
  const db = databaseService.initDatabase(databaseConfig, logger)

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)
  const pubSub = redisService.initPubSub(redisOptions, logger)

  const { entityId } = treatmentJob.data

  try {
    const { plan } = await planService.consumePlan(db, {
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

    await subscriptionCacheService.saveSubscriptionCache(redis, {
      subscriptionId: subscription.id,
      userId: subscription.userId,
      planId: subscription.planId,
      priceRub: subscription.priceRub,
      status: subscription.status,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
      queuedAt: subscription.queuedAt,
      timeoutAt: subscription.timeoutAt,
      finishAt: subscription.finishAt
    })

    await redisService.publishBackLog(pubSub, backLog)
  } finally {
    await redisService.closePubSub(pubSub)
    await redisService.closeRedis(redis)

    await databaseService.closeDatabase(db)

    treatmentResult.durationTime = Date.now() - startTime
  }
}

const processBot: ProcessName = async function (config, logger, treatmentJob, treatmentResult) {
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
    const { bot, backLog } = await botService.consumeBot(db, {
      entityId,
      data: {}
    })

    await botCacheService.saveBotCache(redis, {
      botId: bot.id,
      userId: bot.userId,
      token: bot.token,
      isLinked: bot.isLinked,
      isEnabled: bot.isEnabled,
      createdAt: bot.createdAt,
      updatedAt: bot.updatedAt,
      queuedAt: bot.queuedAt
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
  const scrapingQueue = scrapingService.initQueue(queueConnection, logger)
  const broadcastQueue = broadcastService.initQueue(queueConnection, logger)

  const { entityId } = treatmentJob.data

  try {
    const { category, backLog } = await categoryService.consumeCategory(db, {
      entityId,
      data: {}
    })

    const scraperId = crypto.createHash('md5').update(category.urlPath).digest('hex')

//  const existsScraperId = await scraperCacheService.fetchTargetScraperLink(redis, {
//    urlPath: category.urlPath
//  })

//  const scraperId = existsScraperId ?? redisService.randomHash()

//  await scraperCacheService.saveScraperCache(redis, {
//    scraperId,
//    urlPath: category.urlPath
//  })

    await categoryCacheService.saveCategoryCache(redis, {
      categoryId: category.id,
      userId: category.userId,
      urlPath: category.urlPath,
      botId: category.botId,
      scraperId,
      isEnabled: category.isEnabled,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      queuedAt: category.queuedAt
    })

    if (category.isEnabled) {
      await broadcastService.addRepeatableJob(broadcastQueue, category.id)
    } else {
      await categoryCacheService.saveProvisoCategoryCache(redis, {
        categoryId: category.id,
        reportedAt: 0
      })

      await broadcastService.removeRepeatableJob(broadcastQueue, category.id)
    }

//  const { scraperCache } = await scraperCacheService.fetchScraperCache(redis, {
//    scraperId
//  })

    const { categoriesCache } = await categoryCacheService.fetchScraperCategoriesCache(redis, {
      scraperId
    })

    if (categoriesCache.length > 0) {
      await scrapingService.addRepeatableJob(scrapingQueue, scraperId)
    } else {
      await scrapingService.removeRepeatableJob(scrapingQueue, scraperId)
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

const processProxy: ProcessName = async function (config, logger, treatmentJob, treatmentResult) {
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
    const { proxy } = await proxyService.consumeProxy(db, {
      entityId,
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
  } finally {
    await checkproxyService.closeQueue(checkproxyQueue)

    await redisService.closePubSub(pubSub)
    await redisService.closeRedis(redis)

    await databaseService.closeDatabase(db)

    treatmentResult.durationTime = Date.now() - startTime
  }
}

export default treatmentProcessor
