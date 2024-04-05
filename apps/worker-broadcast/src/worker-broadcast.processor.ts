import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { DomainError } from '@avito-speculant/common'
import {
  redisService,
  userCacheService,
  subscriptionCacheService,
  categoryCacheService,
  advertCacheService
} from '@avito-speculant/redis'
import {
  ProcessorUnknownNameError,
  UserSubscriptionBreakError,
  BroadcastResult,
  BroadcastProcessor
} from '@avito-speculant/queue'
import { Config, NameProcessSendreport } from './worker-broadcast.js'
import { configSchema } from './worker-broadcast.schema.js'

const broadcastProcessor: BroadcastProcessor = async (broadcastJob) => {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)

  const queueConnection = queueService.getQueueConnection<Config>(config)
  const sendreportQueue = sendreportService.initQueue(queueConnection, logger)

  const result: BroadcastResult = {}

  try {
    const startTime = Date.now()

    const { userCache } = await userCacheService.fetchUserCache(redis, {
      scraperId: broadcastJob.data.userId
    })

    const { subscriptionCache } =
      await subscriptionCacheService.fetchUserSubscriptionCache(redis, {
        userId: userCache.id
      })

    if (subscriptionCache === undefined) {
      throw new UserSubscriptionBreakError({ userCache })
    }

    const leap = startTime > userCache.checkpoint

    if (leap) {
      userCache.checkpoint = startTime + subscriptionCache.intervalSec * 1000
    }

    await userCacheService.renewUserCache(redis, {
      userId: userCache.id,
      checkpoint: userCache.checkpoint
    })

    const { categoriesCache } = await categoryCacheService.fetchUserCategoriesCache(redis, {
      userId: userCache.id
    })

    for (const categoryCache of categoriesCache) {
      if (leap) {
        await advertCacheService.pourCategoryAdvertsWait(redis, {
          scraperId: categoryCache.scraperId,
          categoryId: categoryCache.id
        })
      }

      await advertCacheService.pourScraperAdvertsSend(redis, {
        categoryId: categoryCache.id,
        count: 10
      })

      const advertsCache = advertCacheService.fetchCategoryAdvertsCache(redis, {
        categoryId: categoryCache.id,
        'send'
      })

      for (const advertCache of advertsCache) {
        await sendreportService.addJob(
          categoryCache.id,
          advertCache.id
        )
      }
    }



  } catch (error) {
    if (error instanceof DomainError) {
      if (error.isEmergency()) {
        // ...

        logger.fatal(`BroadcastWorker emergency shutdown`)
      }
    }

    throw error
  } finally {
    await sendreportService.closeQueue(sendreportQueue)
    await redisService.closeRedis(redis)
  }

  return result
}

const processDefault: NameProcessSendreport = async (
  config,
  logger,
  redis,
  broadcastJob,
  sendreportQueue
) => {
  try {
    const startTime = Date.now()

    return {
      durationTime: Date.now() - startTime,
    }
  } catch (error) {
    if (error instanceof DomainError) {
      error.setEmergency()
    }

    throw error
  } finally {
    await sendreportService.closeQueue(sendreportQueue)
  }
}

export default broadcastProcessor
