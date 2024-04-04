import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { DomainError } from '@avito-speculant/common'
import {
  redisService,
  subscriptionCacheService,
  categoryCacheService,
  proxyCacheService,
  scraperCacheService,
  advertCacheService
} from '@avito-speculant/redis'
import {
  ProcessorUnknownNameError,
  HeraldingResult,
  HeraldingProcessor
} from '@avito-speculant/queue'
import { Config, NameProcess, CurlRequestArgs } from './worker-heralding.js'
import { configSchema } from './worker-heralding.schema.js'

const heraldingProcessor: HeraldingProcessor = async (heraldingJob) => {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)

  const result: HeraldingResult = {}

  try {
    const name = heraldingJob.name

    switch (name) {
      case 'default': {
        result[name] = await processDefault(config, logger, redis, heraldingJob)

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

        logger.fatal(`HeraldingWorker emergency shutdown`)
      }
    }

    throw error
  } finally {
    await redisService.closeRedis(redis)
  }

  return result
}

const processDefault: NameProcess = async (config, logger, redis, heraldingJob) => {
  try {
    const startTime = Date.now()

    const { userCache } = await userCacheService.fetchUserCache(redis, {
      scraperId: heraldingJob.data.userId
    })

    const { subscriptionCache } = await subscriptionCacheService.fetchUserSubscriptionCache(
      redis,
      {
        userId: userCache.id
      }
    )

    if (subscriptionCache === undefined) {
      throw new UserSubscriptionLostError({ userCache })
    }

    const foobar = startTime < userCache.nextTime

    await userCacheService.renewUserCache(redis, {
      userId: userCache.id,
      nextTime: userCache.nextTime
    })

    const { categoriesCache } = await categoryCacheService.fetchUserCategoriesCache(redis, {
      userId: userCache.id
    })

    for (const categoryCache of categoriesCache) {
      if (foobar) {
        const newAdverts = await advertCacheService.moveCategoryAdvertsReady(redis, {
          categoryId: categoryCache.id,
          scraperId: categoryCache.scraperId
        })
      }

      const sendingAdverts = await advertCacheService.moveScraperAdvertsSending(redis, {
        categoryId: categoryCache.id,
        scraperId: categoryCache.scraperId
      })

    }

    if (foobar) {
      userCache.nextTime = startTime + subscriptionCache.intervalSec * 1000
    }

    return {
      userId: userCache.id,
      durationTime: Date.now() - startTime,
    }
  } catch (error) {
    if (error instanceof DomainError) {
      error.setEmergency()
    }

    throw error
  }
}

export default heraldingProcessor
