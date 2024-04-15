import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { DomainError } from '@avito-speculant/common'
import {
  AvitoReport,
  redisService,
  userCacheService,
  subscriptionCacheService,
  categoryCacheService,
  advertCacheService,
  reportCacheService
} from '@avito-speculant/redis'
import {
  UserSubscriptionBreakError,
  BroadcastResult,
  BroadcastProcessor
} from '@avito-speculant/queue'
import { Config, ProcessDefault } from './worker-broadcast.js'
import { configSchema } from './worker-broadcast.schema.js'

const broadcastProcessor: BroadcastProcessor = async function (broadcastJob) {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)

  const broadcastResult: BroadcastResult = {}

  try {
    await processDefault(config, logger, redis, broadcastJob, broadcastResult)
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

const processDefault: ProcessDefault = async function (
  config,
  logger,
  redis,
  broadcastJob,
  broadcastResult
) {
  try {
    const startTime = Date.now()
    const name = broadcastJob.name
    const { userId } = broadcastJob.data

    const { userCache } = await userCacheService.fetchUserCache(redis, {
      userId
    })

    const { subscriptionCache } = await subscriptionCacheService.fetchUserSubscriptionCache(redis, {
      userId: userCache.id
    })

    if (subscriptionCache === undefined) {
      throw new UserSubscriptionBreakError({ userCache })
    }

    const checkpoint = startTime > userCache.checkpointAt
    if (checkpoint) {
      userCache.checkpointAt = startTime + subscriptionCache.intervalSec * 1000
    }

    await userCacheService.renewUserCache(redis, {
      userId: userCache.id,
      checkpointAt: userCache.checkpointAt
    })

    const { categoriesCache } = await categoryCacheService.fetchUserCategoriesCache(redis, {
      userId: userCache.id
    })

    for (const categoryCache of categoriesCache) {
      if (categoryCache.skipFirst) {
        await advertCacheService.pourCategoryAdvertsSkip(redis, {
          scraperId: categoryCache.scraperId,
          categoryId: categoryCache.id
        })
      } else {
        if (checkpoint) {
          await advertCacheService.pourCategoryAdvertsWait(redis, {
            scraperId: categoryCache.scraperId,
            categoryId: categoryCache.id
          })
        }

        await advertCacheService.pourCategoryAdvertsSend(redis, {
          categoryId: categoryCache.id,
          count: config.BROADCAST_ADVERTS_LIMIT
        })

        const { advertsCache } = await advertCacheService.fetchCategoryAdvertsCache(redis, {
          categoryId: categoryCache.id,
          topic: 'send'
        })

        const avitoReports = advertsCache.map(
          (advertCache): AvitoReport => [
            categoryCache.id,
            advertCache.id,
            userCache.tgFromId,
            advertCache.postedAt
          ]
        )

        reportCacheService.saveReportsCache(redis, {
          avitoReports
        })
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
  }
}

export default broadcastProcessor
