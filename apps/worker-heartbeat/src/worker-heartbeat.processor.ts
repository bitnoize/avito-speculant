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
  subscriptionCacheService,
  categoryCacheService,
  scraperCacheService
} from '@avito-speculant/redis'
import {
  ProcessorUnknownStepError,
  LostRepeatableJobError,
  HeartbeatResult,
  HeartbeatProcessor,
  queueService,
  treatmentService,
  scrapingService
} from '@avito-speculant/queue'
import { Config, ProcessTreatment, ProcessScraping } from './worker-heartbeat.js'
import { configSchema } from './worker-heartbeat.schema.js'

const heartbeatProcessor: HeartbeatProcessor = async (heartbeatJob) => {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
  const db = databaseService.initDatabase(databaseConfig, logger)

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)

  const queueConnection = queueService.getQueueConnection<Config>(config)

  const result: HeartbeatResult = {}

  try {
    let { step } = heartbeatJob.data

    while (step !== 'complete') {
      switch (step) {
        case 'users': {
          const treatmentQueue = treatmentService.initQueue(queueConnection, logger)

          result[step] = await processUsers(config, logger, db, treatmentQueue)

          step = 'plans'
          await heartbeatJob.updateData({ step })

          break
        }

        case 'plans': {
          const treatmentQueue = treatmentService.initQueue(queueConnection, logger)

          result[step] = await processPlans(config, logger, db, treatmentQueue)

          step = 'subscriptions'
          await heartbeatJob.updateData({ step })

          break
        }

        case 'subscriptions': {
          const treatmentQueue = treatmentService.initQueue(queueConnection, logger)

          result[step] = await processSubscriptions(config, logger, db, treatmentQueue)

          step = 'categories'
          await heartbeatJob.updateData({ step })

          break
        }

        case 'categories': {
          const treatmentQueue = treatmentService.initQueue(queueConnection, logger)

          result[step] = await processCategories(config, logger, db, treatmentQueue)

          step = 'proxies'
          await heartbeatJob.updateData({ step })

          break
        }

        case 'proxies': {
          const treatmentQueue = treatmentService.initQueue(queueConnection, logger)

          result[step] = await processProxies(config, logger, db, treatmentQueue)

          step = 'scrapers'
          await heartbeatJob.updateData({ step })

          break
        }

        case 'scrapers': {
          const scrapingQueue = scrapingService.initQueue(queueConnection, logger)

          result[step] = await processScrapers(config, logger, redis, scrapingQueue)

          step = 'complete'
          await heartbeatJob.updateData({ step })

          break
        }

        default: {
          throw new ProcessorUnknownStepError({ step })
        }
      }
    }
  } catch (error) {
    if (error instanceof DomainError) {
      if (error.isEmergency()) {
        // ...

        logger.fatal(`HeartbeatWorker emergency shutdown`)
      }
    }

    throw error
  } finally {
    await redisService.closeRedis(redis)
    await databaseService.closeDatabase(db)
  }

  return result
}

const processUsers: ProcessTreatment = async (config, logger, db, treatmentQueue) => {
  try {
    const { users } = await userService.produceUsers(db, {
      limit: config.HEARTBEAT_PRODUCE_USERS_LIMIT
    })

    await treatmentService.addJobs(
      treatmentQueue,
      'user',
      users.map((user) => user.id)
    )

    return { count: users.length }
  } catch (error) {
    if (error instanceof DomainError) {
      logger.error(`HeartbeatProcessor processUsers exception`)

      error.setEmergency()
    }

    throw error
  } finally {
    await treatmentService.closeQueue(treatmentQueue)
  }
}

const processPlans: ProcessTreatment = async (config, logger, db, treatmentQueue) => {
  try {
    const { plans } = await planService.producePlans(db, {
      limit: config.HEARTBEAT_PRODUCE_PLANS_LIMIT
    })

    await treatmentService.addJobs(
      treatmentQueue,
      'plan',
      plans.map((plan) => plan.id)
    )

    return { count: plans.length }
  } catch (error) {
    if (error instanceof DomainError) {
      logger.error(`HeartbeatProcessor processPlans exception`)

      error.setEmergency()
    }

    throw error
  } finally {
    await treatmentService.closeQueue(treatmentQueue)
  }
}

const processSubscriptions: ProcessTreatment = async (config, logger, db, treatmentQueue) => {
  try {
    const { subscriptions } = await subscriptionService.produceSubscriptions(db, {
      limit: config.HEARTBEAT_PRODUCE_SUBSCRIPTIONS_LIMIT
    })

    await treatmentService.addJobs(
      treatmentQueue,
      'subscription',
      subscriptions.map((subscription) => subscription.id)
    )

    return { count: subscriptions.length }
  } catch (error) {
    if (error instanceof DomainError) {
      logger.error(`HeartbeatProcessor processSubscriptions exception`)

      error.setEmergency()
    }

    throw error
  } finally {
    await treatmentService.closeQueue(treatmentQueue)
  }
}

const processCategories: ProcessTreatment = async (config, logger, db, treatmentQueue) => {
  try {
    const { categories } = await categoryService.produceCategories(db, {
      limit: config.HEARTBEAT_PRODUCE_CATEGORIES_LIMIT
    })

    await treatmentService.addJobs(
      treatmentQueue,
      'category',
      categories.map((category) => category.id)
    )

    return { count: categories.length }
  } catch (error) {
    if (error instanceof DomainError) {
      logger.error(`HeartbeatProcessor processCategories exception`)

      error.setEmergency()
    }

    throw error
  } finally {
    await treatmentService.closeQueue(treatmentQueue)
  }
}

const processProxies: ProcessTreatment = async (config, logger, db, treatmentQueue) => {
  try {
    const { proxies } = await proxyService.produceProxies(db, {
      limit: config.HEARTBEAT_PRODUCE_PROXIES_LIMIT
    })

    await treatmentService.addJobs(
      treatmentQueue,
      'proxy',
      proxies.map((proxy) => proxy.id)
    )

    return { count: proxies.length }
  } catch (error) {
    if (error instanceof DomainError) {
      logger.error(`HeartbeatProcessor processProxies exception`)

      error.setEmergency()
    }

    throw error
  } finally {
    await treatmentService.closeQueue(treatmentQueue)
  }
}

const processScrapers: ProcessScraping = async (config, logger, redis, scrapingQueue) => {
  try {
    const { scrapersCache } = await scraperCacheService.fetchScrapersCache(redis)

    const repeatableJobs = await scrapingQueue.getRepeatableJobs()

    const scraperIds = scrapersCache.map((scraperCache) => scraperCache.id)
    const orphanScrapingJobs = repeatableJobs.filter((repeatableJob) => {
      if (repeatableJob.id == null) {
        throw new LostRepeatableJobError({ repeatableJob })
      }

      return !scraperIds.includes(repeatableJob.id)
    })

    for (const orphanScrapingJob of orphanScrapingJobs) {
      await scrapingQueue.removeRepeatableByKey(orphanScrapingJob.key)

      const logData = {
        job: {
          id: orphanScrapingJob.id,
          key: orphanScrapingJob.key,
          name: orphanScrapingJob.name
        }
      }
      logger.warn(logData, `HeartbeatProcessor remove orphan scraper`)
    }

    for (const scraperCache of scrapersCache) {
      let isChanged = false

      const { categoriesCache } = await categoryCacheService.fetchScraperCategoriesCache(redis, {
        scraperId: scraperCache.id
      })

      for (const categoryCache of categoriesCache) {
        const { subscriptionCache } = await subscriptionCacheService.fetchUserSubscriptionCache(
          redis,
          {
            userId: categoryCache.userId
          }
        )

        if (subscriptionCache.intervalSec < scraperCache.intervalSec) {
          isChanged = true

          scraperCache.intervalSec = subscriptionCache.intervalSec
        }
      }

      const scrapingJob = repeatableJobs.find((repeatableJob) => {
        if (repeatableJob.id == null) {
          throw new LostRepeatableJobError({ repeatableJob })
        }

        return repeatableJob.id === scraperCache.id
      })

      if (scrapingJob !== undefined) {
        // ScrapingJob allready running
        console.log(`ScrapingJob allready running`)

        if (categoriesCache.length === 0) {
          // There are no categories attached to scraper, clear cache and stop job

          await scraperCacheService.dropScraperCache(redis, {
            scraperId: scraperCache.id,
            avitoUrl: scraperCache.avitoUrl
          })

          await scrapingQueue.removeRepeatableByKey(scrapingJob.key)
        } else {
          // Categories exists, save cache and restart job if scraper changed

          await scraperCacheService.saveScraperCache(redis, {
            scraperId: scraperCache.id,
            avitoUrl: scraperCache.avitoUrl,
            intervalSec: scraperCache.intervalSec
          })

          if (isChanged) {
            await scrapingQueue.removeRepeatableByKey(scrapingJob.key)

            await scrapingService.addJob(
              scrapingQueue,
              'desktop',
              scraperCache.id,
              scraperCache.intervalSec * 1000
            )
          }
        }
      } else {
        // There is no scraping job running yet
        console.log(`There is no scraping job running yet`)

        if (categoriesCache.length === 0) {
          // There are no categories attached to scraper, clear cache

          await scraperCacheService.dropScraperCache(redis, {
            scraperId: scraperCache.id,
            avitoUrl: scraperCache.avitoUrl
          })
        } else {
          // Categories attached, save cache and start job

          await scraperCacheService.saveScraperCache(redis, {
            scraperId: scraperCache.id,
            avitoUrl: scraperCache.avitoUrl,
            intervalSec: scraperCache.intervalSec
          })

          await scrapingService.addJob(
            scrapingQueue,
            'desktop',
            scraperCache.id,
            scraperCache.intervalSec * 1000
          )
        }
      }
    }

    return { count: scrapersCache.length }
  } catch (error) {
    if (error instanceof DomainError) {
      logger.error(`HeartbeatProcessor processScrapers exception`)

      error.setEmergency()
    }

    throw error
  } finally {
    await scrapingService.closeQueue(scrapingQueue)
  }
}

export default heartbeatProcessor
