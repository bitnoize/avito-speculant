import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import {
  CategoryReport,
  redisService,
  userCacheService,
  planCacheService,
  subscriptionCacheService,
  botCacheService,
  categoryCacheService,
  advertCacheService,
  reportCacheService
} from '@avito-speculant/redis'
import {
  BROADCAST_ADVERTS_LIMIT,
  BroadcastCategoryError,
  BroadcastUserError,
  BroadcastBotError,
  BroadcastResult,
  BroadcastProcessor,
  queueService,
  sendreportService
} from '@avito-speculant/queue'
import { Config, ProcessName } from './worker-broadcast.js'
import { configSchema } from './worker-broadcast.schema.js'

const broadcastProcessor: BroadcastProcessor = async function (broadcastJob) {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const broadcastResult: BroadcastResult = {
    reports: 0,
    durationTime: 0
  }

  await processDefault(config, logger, broadcastJob, broadcastResult)

  return broadcastResult
}

const processDefault: ProcessName = async function (config, logger, broadcastJob, broadcastResult) {
  const startTime = Date.now()
  const { categoryId } = broadcastJob.data

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)

  const queueConnection = queueService.getQueueConnection<Config>(config)
  const sendreportQueue = sendreportService.initQueue(queueConnection, logger)

  try {
    const { categoryCache } = await categoryCacheService.fetchCategoryCache(redis, {
      categoryId
    })

    if (!(categoryCache.botId !== null && categoryCache.isEnabled)) {
      throw new BroadcastCategoryError({ categoryCache })
    }

    const { userCache } = await userCacheService.fetchUserCache(redis, {
      userId: categoryCache.userId
    })

    if (userCache.activeSubscriptionId === null) {
      throw new BroadcastUserError({ categoryCache })
    }

    const { subscriptionCache } = await subscriptionCacheService.fetchSubscriptionCache(redis, {
      subscriptionId: userCache.activeSubscriptionId
    })

    const { planCache } = await planCacheService.fetchPlanCache(redis, {
      planId: subscriptionCache.planId
    })

    const { botCache } = await botCacheService.fetchBotCache(redis, {
      botId: categoryCache.botId
    })

    if (!(botCache.isLinked && botCache.isEnabled)) {
      throw new BroadcastBotError({ botCache })
    }

    if (categoryCache.reportedAt <= 0) {
      await reportCacheService.saveSkipReportsIndex(redis, {
        scraperId: categoryCache.scraperId,
        categoryId: categoryCache.id
      })

      categoryCache.reportedAt = startTime + planCache.intervalSec * 1000
    } else {
      if (categoryCache.reportedAt < startTime) {
        await reportCacheService.saveWaitReportsIndex(redis, {
          scraperId: categoryCache.scraperId,
          categoryId: categoryCache.id
        })

        categoryCache.reportedAt = startTime + planCache.intervalSec * 1000
      }

      await reportCacheService.saveSendReportsIndex(redis, {
        categoryId: categoryCache.id,
        limit: BROADCAST_ADVERTS_LIMIT
      })

      const { advertsCache } = await advertCacheService.fetchReportAdvertsCache(redis, {
        scraperId: categoryCache.scraperId,
        categoryId: categoryCache.id,
        topic: 'send'
      })

      const categoryReports = advertsCache.map(
        (advertCache): CategoryReport => [advertCache.advertId, advertCache.postedAt]
      )

      reportCacheService.saveReportsCache(redis, {
        scraperId: categoryCache.scraperId,
        categoryId: categoryCache.id,
        tgFromId: userCache.tgFromId,
        token: botCache.token,
        categoryReports
      })

      await sendreportService.addJobs(
        sendreportQueue,
        advertsCache.map((advertCache) => [categoryCache.id, advertCache.advertId])
      )

      broadcastResult.reports = categoryReports.length
    }

    await categoryCacheService.saveProvisoCategoryCache(redis, {
      categoryId: categoryCache.id,
      reportedAt: categoryCache.reportedAt
    })
  } finally {
    await sendreportService.closeQueue(sendreportQueue)

    await redisService.closeRedis(redis)

    broadcastResult.durationTime = Date.now() - startTime
  }
}

export default broadcastProcessor
