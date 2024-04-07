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
  UserSubscriptionBreakError,
  BroadcastResult,
  BroadcastProcessor,
  queueService,
  sendreportService
} from '@avito-speculant/queue'
import { Config, ProcessDefault } from './worker-broadcast.js'
import { configSchema } from './worker-broadcast.schema.js'

const broadcastProcessor: BroadcastProcessor = async (broadcastJob) => {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)

  const queueConnection = queueService.getQueueConnection<Config>(config)

  const broadcastResult: BroadcastResult = {}

  try {
    const sendreportQueue = sendreportService.initQueue(queueConnection, logger)

    await processDefault(
      config,
      logger,
      redis,
      broadcastJob,
      broadcastResult,
      sendreportQueue
    )
  } catch (error) {
    if (error instanceof DomainError) {
      if (error.isEmergency()) {
        // ...

        logger.fatal(`BroadcastWorker emergency shutdown`)
      }
    }

    throw error
  } finally {
    await redisService.closeRedis(redis)
  }

  return broadcastResult
}

const processDefault: ProcessDefault = async function(
  config,
  logger,
  redis,
  broadcastJob,
  broadcastResult,
  sendreportQueue
) {
  try {
    const startTime = Date.now()
    const name = broadcastJob.name
    const { userId } = broadcastJob.data

    const { userCache } = await userCacheService.fetchUserCache(redis, {
      userId
    })

    const { subscriptionCache } =
      await subscriptionCacheService.fetchUserSubscriptionCache(redis, {
        userId: userCache.id
      })

    if (subscriptionCache === undefined) {
      throw new UserSubscriptionBreakError({ userCache })
    }

    console.log(`001`)
    const checkpoint = startTime > userCache.checkpointAt
    if (checkpoint) {
      userCache.checkpointAt = startTime + subscriptionCache.intervalSec * 1000
    }

    console.log(`002`)
    await userCacheService.renewUserCache(redis, {
      userId: userCache.id,
      checkpointAt: userCache.checkpointAt
    })

    console.log(`003`)
    const { categoriesCache } = await categoryCacheService.fetchUserCategoriesCache(redis, {
      userId: userCache.id
    })

    console.log(`004`)
    for (const categoryCache of categoriesCache) {
    console.log(`005`)
      if (checkpoint) {
        await advertCacheService.pourCategoryAdvertsWait(redis, {
          scraperId: categoryCache.scraperId,
          categoryId: categoryCache.id
        })
      }
    console.log(`006`)

      await advertCacheService.pourCategoryAdvertsSend(redis, {
        categoryId: categoryCache.id,
        count: 20
      })
    console.log(`007`)

      const { advertsCache } = await advertCacheService.fetchCategoryAdvertsCache(redis, {
        categoryId: categoryCache.id,
        topic: 'send'
      })
    console.log(`008`)

      for (const advertCache of advertsCache) {
        await sendreportService.addJob(
          sendreportQueue,
          categoryCache.id,
          advertCache.id
        )
      }
    }

    broadcastResult[name] = {
      durationTime: Date.now() - startTime
    }
  } catch (error) {
    if (error instanceof DomainError) {
      logger.error(`BroadcastProcessor processDefault exception`)

      error.setEmergency()
    }

    throw error
  } finally {
    await sendreportService.closeQueue(sendreportQueue)
  }
}

export default broadcastProcessor
