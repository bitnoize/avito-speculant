import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import {
  AvitoReport,
  redisService,
  userCacheService,
  subscriptionCacheService,
  categoryCacheService,
  advertCacheService,
  reportCacheService
} from '@avito-speculant/redis'
import { BroadcastResult, BroadcastProcessor } from '@avito-speculant/queue'
import { Config, ProcessName } from './worker-broadcast.js'
import { configSchema } from './worker-broadcast.schema.js'

const broadcastProcessor: BroadcastProcessor = async function (broadcastJob) {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const broadcastResult: BroadcastResult = {
    durationTime: 0
  }

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

const processDefault: ProcessName = async function (
  config,
  logger,
  broadcastJob,
  broadcastResult
) {
  const startTime = Date.now()
  const { categoryId } = broadcastJob.data

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)

  try {
    const { categoryCache } = await categoryCacheService.fetchCategoryCache(redis, {
      categoryId
    })

    if (!categoryCache.isEnabled) {
      throw new UserSubscriptionBreakError({ categoryCache })
    }

    const {
      userCache,
      subscriptionCache,
      planCache
    } = await userCacheService.fetchUserCache(redis, {
      userId: categoryCache.userId
    })

    if (
      userCache.activeSubscriptionId === null ||
      subscriptionCache === undefined ||
      planCache == undefined
    ) {
      throw new UserSubscriptionBreakError({ userCache, subscriptionCache, planCache })
    }

    const firstTime = categoryCache.reportedAt === 0 ? true : false

    if (categoryCache.reportedAt === 0) {
      await reportCacheService.saveFirstTimeReportsIndex(redis, {
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
        limit: config.BROADCAST_ADVERTS_LIMIT
      })

      const { advertsCache } = await advertCacheService.fetchAdvertsCache(redis, {
        scraperId: categoryCache.scraperId
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
          limit: config.BROADCAST_ADVERTS_LIMIT
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
