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
  businessService,
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
  const businessQueue = businessService.initQueue(queueConnection, logger)
  const scraperQueue = scraperService.initQueue(queueConnection, logger)

  let step = heartbeatJob.data.step

  const counters = {
    users: 0,
    plans: 0,
    subscriptions: 0,
    categories: 0,
    proxies: 0,
    scrapers: 0,
    reporters: 0
  }

  while (step !== 'complete') {
    switch (step) {
      case 'queue-users': {
        //
        // queue-users
        //

        logger.info('Debug users 001')
        const { users } = await userService.queueUsers(db, {
          limit: config.HEARTBEAT_QUEUE_USERS_LIMIT
        })

        await businessService.addJobs(
          businessQueue,
          'user',
          users.map((user) => user.id)
        )

        counters.users = users.length

        step = 'queue-plans'
        await heartbeatJob.updateData({
          step
        })

        logger.info('Debug users 002')
        break
      }

      case 'queue-plans': {
        //
        // queue-plans
        //

        logger.info('Debug plans 001')
        const { plans } = await planService.queuePlans(db, {
          limit: config.HEARTBEAT_QUEUE_PLANS_LIMIT
        })

        await businessService.addJobs(
          businessQueue,
          'plan',
          plans.map((plan) => plan.id)
        )

        counters.plans = plans.length

        step = 'queue-subscriptions'
        await heartbeatJob.updateData({
          step
        })

        logger.info('Debug plans 002')
        break
      }

      case 'queue-subscriptions': {
        //
        // queue-subscriptions
        //

        logger.info('Debug subscriptions 001')
        const { subscriptions } = await subscriptionService.queueSubscriptions(db, {
          limit: config.HEARTBEAT_QUEUE_SUBSCRIPTIONS_LIMIT
        })

        await businessService.addJobs(
          businessQueue,
          'subscription',
          subscriptions.map((subscription) => subscription.id)
        )

        counters.subscriptions = subscriptions.length

        step = 'queue-categories'
        await heartbeatJob.updateData({
          step
        })

        logger.info('Debug subscriptions 001')
        break
      }

      case 'queue-categories': {
        //
        // queue-categories
        //

        logger.info('Debug categories 001')
        const { categories } = await categoryService.queueCategories(db, {
          limit: config.HEARTBEAT_QUEUE_CATEGORIES_LIMIT
        })

        await businessService.addJobs(
          businessQueue,
          'category',
          categories.map((category) => category.id)
        )

        counters.categories = categories.length

        step = 'queue-proxies'
        await heartbeatJob.updateData({
          step
        })

        logger.info('Debug categories 002')
        break
      }

      case 'queue-proxies': {
        //
        // queue-proxies
        //

        logger.info('Debug proxies 001')
        const { proxies } = await proxyService.queueProxies(db, {
          limit: config.HEARTBEAT_QUEUE_PROXIES_LIMIT
        })

        await businessService.addJobs(
          businessQueue,
          'proxy',
          proxies.map((proxy) => proxy.id)
        )

        counters.proxies = proxies.length

        step = 'check-scrapers'
        await heartbeatJob.updateData({
          step
        })

        logger.info('Debug proxies 002')
        break
      }

      case 'check-scrapers': {
        //
        // check-scrapers
        //

        logger.info('Debug scrapers 001')
        const { scrapersCache } = await scraperCacheService.fetchScrapersCache(redis)

        logger.info('Debug scrapers 002')
        const repeatableJobs = await scraperQueue.getRepeatableJobs()

        logger.info('Debug scrapers 003')
        const scraperJobIds = scrapersCache.map((scraperCache) => scraperCache.jobId)
        const orphanScraperJobs = repeatableJobs.filter(
          (repeatableJob) => repeatableJob.id != null && !scraperJobIds.includes(repeatableJob.id)
        )

        logger.info('Debug scrapers 004')
        for (const orphanScraperJob of orphanScraperJobs) {
          await scraperQueue.removeRepeatableByKey(orphanScraperJob.key)
        }

        logger.info('Debug scrapers 005')
        for (const scraperCache of scrapersCache) {
          let isChanged = false

        logger.info('Debug scrapers 006')
          const { categoriesCache } = await categoryCacheService.fetchScraperCategoriesCache(
            redis,
            {
              scraperJobId: scraperCache.jobId
            }
          )

        logger.info('Debug scrapers 0017')
          for (const categoryCache of categoriesCache) {
            logger.info('Debug scrapers 008')
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

          logger.info('Debug scrapers 009')
          const scraperJob = await scraperQueue.getJob(scraperCache.jobId)

          if (scraperJob !== undefined) {
            // ScraperJob allready running

            logger.info('Debug scrapers 010')
            if (scraperJob.repeatJobKey === undefined) {
              throw new Error(`ScraperJob lost repeatJobKey`)
            }

            if (categoriesCache.length === 0) {
              // There are no categories attached to scraper, clear cache and stop job

              logger.info('Debug scrapers 011')
              await scraperCacheService.dropScraperCache(redis, {
                scraperJobId: scraperCache.jobId,
                avitoUrl: scraperCache.avitoUrl
              })

              await scraperQueue.removeRepeatableByKey(scraperJob.repeatJobKey)
            } else {
              // Categories exists, save cache and restart job if scraper changed

              logger.info('Debug scrapers 012')
              await scraperCacheService.saveScraperCache(redis, {
                scraperJobId: scraperCache.jobId,
                avitoUrl: scraperCache.avitoUrl,
                intervalSec: scraperCache.intervalSec
              })

              if (isChanged) {
                logger.info('Debug scrapers 013')
                await scraperQueue.removeRepeatableByKey(scraperJob.repeatJobKey)

                logger.info('Debug scrapers 014')
                await scraperService.addJob(
                  scraperQueue,
                  'default',
                  scraperCache.intervalSec,
                  scraperCache.jobId
                )
              }
            }
          } else {
            // There is no scraper job running yet

            if (categoriesCache.length === 0) {
              // There are no categories attached to scraper, clear cache

                logger.info('Debug scrapers 015')
              await scraperCacheService.dropScraperCache(redis, {
                scraperJobId: scraperCache.jobId,
                avitoUrl: scraperCache.avitoUrl
              })
            } else {
              // Categories attached, save cache and start job

                logger.info('Debug scrapers 016')
              await scraperCacheService.saveScraperCache(redis, {
                scraperJobId: scraperCache.jobId,
                avitoUrl: scraperCache.avitoUrl,
                intervalSec: scraperCache.intervalSec
              })

                logger.info('Debug scrapers 017')
              await scraperService.addJob(
                scraperQueue,
                'default',
                scraperCache.intervalSec,
                scraperCache.jobId
              )
            }
          }
        }

        counters.scrapers = scrapersCache.length

        step = 'check-reporters'
        await heartbeatJob.updateData({
          step
        })

        logger.info('Debug scrapers 100')
        break
      }

      case 'check-reporters': {
        //
        // check-reporters
        //

        step = 'complete'
        await heartbeatJob.updateData({
          step
        })

        break
      }

      default: {
        throw new Error(`Unknown heartbeat step '${step}'`)
      }
    }
  }

  logger.info({ counters }, `HeartbeatJob complete`)

  await scraperService.closeQueue(scraperQueue)
  await businessService.closeQueue(businessQueue)
  await redisService.closeRedis(redis)
  await databaseService.closeDatabase(db)
}

export default heartbeatProcessor
