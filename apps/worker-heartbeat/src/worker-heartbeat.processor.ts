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
  userCacheService,
  planCacheService,
  subscriptionCacheService,
  categoryCacheService,
  proxyCacheService,
  scraperCacheService
} from '@avito-speculant/redis'
import {
  WaitingChildrenError,
  HeartbeatProcessor,
  BusinessJob,
  queueService,
  businessService,
  scraperService
} from '@avito-speculant/queue'
import { Config } from './worker-heartbeat.js'
import { configSchema } from './worker-heartbeat.schema.js'

const heartbeatProcessor: HeartbeatProcessor = async (heartbeatJob, token) => {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
  const db = databaseService.initDatabase(databaseConfig, logger)

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)
  const pubSub = redisService.initPubSub(redisOptions, logger)

  const queueConnection = queueService.getQueueConnection<Config>(config)
  const businessQueue = businessService.initQueue(queueConnection, logger)
  const scraperQueue = scraperService.initQueue(queueConnection, logger)

  let step = heartbeatJob.data.step

  const businessJobs: BusinessJob[] = []

  while (step !== 'complete') {
    switch (step) {
      case 'queue-users': {
        //
        // Heartbeat Job 'queue-users' step
        //

        const queuedUsers = await userService.queueUsers(db, {
          limit: config.HEARTBEAT_QUEUE_USERS_LIMIT
        })

        logger.info(queuedUsers)

        const { users } = queuedUsers

        const businessUserJobs = await businessService.addJobs(
          businessQueue,
          'user',
          users.map((user) => user.id),
          heartbeatJob
        )

        step = 'queue-plans'
        await heartbeatJob.updateData({
          step
        })

        businessJobs.concat(businessUserJobs)

        break
      }

      case 'queue-plans': {
        //
        // Heartbeat Job 'queue-plans' step
        //

        const queuedPlans = await planService.queuePlans(db, {
          limit: config.HEARTBEAT_QUEUE_PLANS_LIMIT
        })

        logger.info(queuedPlans)

        const { plans } = queuedPlans

        const businessPlanJobs = await businessService.addJobs(
          businessQueue,
          'plan',
          plans.map((plan) => plan.id),
          heartbeatJob,
        )

        step = 'queue-subscriptions'
        await heartbeatJob.updateData({
          step
        })

        businessJobs.concat(businessPlanJobs)

        break
      }

      case 'queue-subscriptions': {
        const queuedSubscriptions = await subscriptionService.queueSubscriptions(db, {
          limit: config.HEARTBEAT_QUEUE_SUBSCRIPTIONS_LIMIT
        })

        logger.info(queuedSubscriptions)

        const { subscriptions } = queuedSubscriptions

        const businessSubscriptionJobs = await businessService.addJobs(
          businessQueue,
          'subscription',
          subscriptions.map((subscription) => subscription.id),
          heartbeatJob,
        )

        step = 'queue-categories'
        await heartbeatJob.updateData({
          step
        })

        businessJobs.concat(businessSubscriptionJobs)

        break
      }

      case 'queue-categories': {
        const queuedCategories = await categoryService.queueCategories(db, {
          limit: config.HEARTBEAT_QUEUE_CATEGORIES_LIMIT
        })

        logger.info(queuedCategories)

        const { categories } = queuedCategories

        const businessCategoryJobs = await businessService.addJobs(
          businessQueue,
          'category',
          categories.map((category) => category.id),
          heartbeatJob
        )

        step = 'queue-proxies'
        await heartbeatJob.updateData({
          step
        })

        businessJobs.concat(businessCategoryJobs)

        break
      }

      case 'queue-proxies': {
        const queuedProxies = await proxyService.queueProxies(db, {
          limit: config.HEARTBEAT_QUEUE_PROXIES_LIMIT
        })

        logger.info(queuedProxies)

        const { proxies } = queuedProxies

        const businessProxyJobs = await businessService.addJobs(
          businessQueue,
          'proxy',
          proxies.map((proxy) => proxy.id),
          heartbeatJob
        )

        step = 'wait-results'
        await heartbeatJob.updateData({
          step
        })

        businessJobs.concat(businessProxyJobs)

        break
      }

      case 'wait-results': {
        if (token === undefined) {
          throw new Error(`HeartbeatProcessor lost token`)
        }

        const shouldWait = await heartbeatJob.moveToWaitingChildren(token)

        if (shouldWait) {
          throw new WaitingChildrenError()
        }

        logger.info(`HeartbeatJob wait results done`)

        step = 'check-scrapers'
        await heartbeatJob.updateData({
          step
        })

        break
      }

      case 'check-scrapers': {
        const listedScrapersCache = await scraperCacheService.listScrapersCache(redis)

        logger.info(listedScrapersCache)

        const { scrapersCache } = listedScrapersCache

        const repeatableJobs = await scraperQueue.getRepeatableJobs()

        const scraperJobIds = scrapersCache.map((scraperCache) => scraperCache.jobId)
        const orphanScraperJobs = repeatableJobs.filter((repeatableJob) => (
          repeatableJob.id != null && !scraperJobIds.includes(repeatableJob.id)
        ))

        for (const orphanScraperJob of orphanScraperJobs) {
          await scraperQueue.removeRepeatableByKey(orphanScraperJob.key)

          const logData = {
            scraperJobKey: orphanScraperJob.key
          }

          logger.warn(logData, `ScraperJob removed orphan job`)
        }

        for (const scraperCache of scrapersCache) {
          const isChanged = false

          const listedCategoriesCache =
            await categoryCacheService.listScraperCategoriesCache(redis, {
              scraperJobId: scraperCache.jobId
            })

          logger.info(listedCategoriesCache)

          const { categoriesCache } = listedCategoriesCache

          for (const categoryCache of categoriesCache) {
            if (categoryCache.intervalSec < scraperCache.intervalSec) {
              isChanged = true

              scraperCache.intervalSec = categoryCache.intervalSec
            }
          }

          const scraperJob = scraperQueue.getJob(scraperCache.jobId)

          if (categoriesCache.length === 0) {
            if (scraperJob !== undefined) {
              await scraperQueue.removeRepeatableByKey(scraperJob.key)
            }

            const droppedScraperCache = await scraperCacheService.dropScraperCache(redis, {
              scraperJobId: scraperCache.jobId
            })

            logger.info(droppedScraperCache)
          } else {
            const renewedScraperCache = await scraperCacheService.renewScraperCache(redis, {
              scraperJobId: scraperCache.jobId,
              intervalSec: scraperCache.intervalSec
            })

            logger.info(renewedScraperCache)

            if (scraperJob !== undefined) {
              if (scraperCache.intervalSec !== scraperIntervalSec) {
                await scraperQueue.removeRepeatableByKey(scraperJob.key)

                const newScraperJob = await scraperService.addJob(
                  scraperQueue,
                  'default',
                  scraperCache.avitoUrl,
                  scraperIntervalSec,
                  scraperCache.jobId
                )

                logger.info(``)
              }
            } else {
              const newScraperJob = await scraperService.addJob(
                scraperQueue,
                'default',
                newScraperCache.avitoUrl,
                newScraperCache.intervalSec
              )

              logger.info(``)
            }
          }
        }

        step = 'complete'
        await heartbeatJob.updateData({
          step
        })

        break
      }

      default: {
        throw new Error(`Unknown heartbeat step`)
      }
    }
  }

  if (businessJobs.length > 0) {
    logger.info(`HeartbeatQueue completed business jobs`)
  }

  await scraperQueue.close()
  await businessQueue.close()
  await pubSub.disconnect()
  await redis.disconnect()
  await db.destroy()
}

export default heartbeatProcessor
