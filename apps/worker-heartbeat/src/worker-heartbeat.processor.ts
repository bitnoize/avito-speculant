import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
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
  HeartbeatProcessor,
  queueService,
  treatmentService,
  scraperService
} from '@avito-speculant/queue'
import { Config } from './worker-heartbeat.js'
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
  const treatmentQueue = treatmentService.initQueue(queueConnection, logger)
  const scraperQueue = scraperService.initQueue(queueConnection, logger)

  let step = heartbeatJob.data.step

  const counters: Record<string, number> = {}

  while (step !== 'complete') {
    switch (step) {
      case 'produce-users': {
        //
        // produce-users
        //

        const { users } = await userService.produceUsers(db, {
          limit: config.HEARTBEAT_PRODUCE_USERS_LIMIT
        })

        await treatmentService.addJobs(
          treatmentQueue,
          'user',
          users.map((user) => user.id)
        )

        counters.users = users.length

        step = 'produce-plans'
        await heartbeatJob.updateData({ step })

        break
      }

      case 'produce-plans': {
        //
        // produce-plans
        //

        const { plans } = await planService.producePlans(db, {
          limit: config.HEARTBEAT_PRODUCE_PLANS_LIMIT
        })

        await treatmentService.addJobs(
          treatmentQueue,
          'plan',
          plans.map((plan) => plan.id)
        )

        counters.plans = plans.length

        step = 'produce-subscriptions'
        await heartbeatJob.updateData({ step })

        break
      }

      case 'produce-subscriptions': {
        //
        // produce-subscriptions
        //

        const { subscriptions } = await subscriptionService.produceSubscriptions(db, {
          limit: config.HEARTBEAT_PRODUCE_SUBSCRIPTIONS_LIMIT
        })

        await treatmentService.addJobs(
          treatmentQueue,
          'subscription',
          subscriptions.map((subscription) => subscription.id)
        )

        counters.subscriptions = subscriptions.length

        step = 'produce-categories'
        await heartbeatJob.updateData({ step })

        break
      }

      case 'produce-categories': {
        //
        // produce-categories
        //

        const { categories } = await categoryService.produceCategories(db, {
          limit: config.HEARTBEAT_PRODUCE_CATEGORIES_LIMIT
        })

        await treatmentService.addJobs(
          treatmentQueue,
          'category',
          categories.map((category) => category.id)
        )

        counters.categories = categories.length

        step = 'produce-proxies'
        await heartbeatJob.updateData({ step })

        break
      }

      case 'produce-proxies': {
        //
        // produce-proxies
        //

        const { proxies } = await proxyService.produceProxies(db, {
          limit: config.HEARTBEAT_PRODUCE_PROXIES_LIMIT
        })

        await treatmentService.addJobs(
          treatmentQueue,
          'proxy',
          proxies.map((proxy) => proxy.id)
        )

        counters.proxies = proxies.length

        step = 'check-scrapers'
        await heartbeatJob.updateData({ step })

        break
      }

      case 'check-scrapers': {
        //
        // check-scrapers
        //

        const { scrapersCache } = await scraperCacheService.fetchScrapersCache(redis)

        const repeatableJobs = await scraperQueue.getRepeatableJobs()

        const scraperJobIds = scrapersCache.map((scraperCache) => scraperCache.jobId)
        const orphanScraperJobs = repeatableJobs.filter(
          (repeatableJob) => repeatableJob.id != null && !scraperJobIds.includes(repeatableJob.id)
        )

        for (const orphanScraperJob of orphanScraperJobs) {
          await scraperQueue.removeRepeatableByKey(orphanScraperJob.key)
        }

        for (const scraperCache of scrapersCache) {
          let isChanged = false

          const { categoriesCache } = await categoryCacheService.fetchScraperCategoriesCache(
            redis,
            {
              scraperJobId: scraperCache.jobId
            }
          )

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

          const scraperJob = await scraperQueue.getJob(scraperCache.jobId)

          if (scraperJob !== undefined) {
            // ScraperJob allready running

            if (scraperJob.repeatJobKey === undefined) {
              throw new Error(`ScraperJob lost repeatJobKey`)
            }

            if (categoriesCache.length === 0) {
              // There are no categories attached to scraper, clear cache and stop job

              await scraperCacheService.dropScraperCache(redis, {
                scraperJobId: scraperCache.jobId,
                avitoUrl: scraperCache.avitoUrl
              })

              await scraperQueue.removeRepeatableByKey(scraperJob.repeatJobKey)
            } else {
              // Categories exists, save cache and restart job if scraper changed

              await scraperCacheService.saveScraperCache(redis, {
                scraperJobId: scraperCache.jobId,
                avitoUrl: scraperCache.avitoUrl,
                intervalSec: scraperCache.intervalSec
              })

              if (isChanged) {
                await scraperQueue.removeRepeatableByKey(scraperJob.repeatJobKey)

                await scraperService.addJob(
                  scraperQueue,
                  'default',
                  scraperCache.intervalSec * 1000,
                  scraperCache.jobId
                )
              }
            }
          } else {
            // There is no scraper job running yet

            if (categoriesCache.length === 0) {
              // There are no categories attached to scraper, clear cache

              await scraperCacheService.dropScraperCache(redis, {
                scraperJobId: scraperCache.jobId,
                avitoUrl: scraperCache.avitoUrl
              })
            } else {
              // Categories attached, save cache and start job

              await scraperCacheService.saveScraperCache(redis, {
                scraperJobId: scraperCache.jobId,
                avitoUrl: scraperCache.avitoUrl,
                intervalSec: scraperCache.intervalSec
              })

              await scraperService.addJob(
                scraperQueue,
                'default',
                scraperCache.intervalSec * 1000,
                scraperCache.jobId
              )
            }
          }
        }

        counters.scrapers = scrapersCache.length

        step = 'complete'
        await heartbeatJob.updateData({ step })

        break
      }

      default: {
        throw new Error(`Unknown heartbeat step '${step}'`)
      }
    }
  }

  logger.info({ counters }, `HeartbeatJob complete`)

  await scraperService.closeQueue(scraperQueue)
  await treatmentService.closeQueue(treatmentQueue)
  await redisService.closeRedis(redis)
  await databaseService.closeDatabase(db)
}

export default heartbeatProcessor
