import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import {
  databaseService,
  userService,
  planService,
  subscriptionService,
  categoryService
} from '@avito-speculant/database'
import { redisService, systemService } from '@avito-speculant/redis'
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
        const queueUsers = await userService.queueUsers(db, {
          limit: config.HEARTBEAT_QUEUE_USERS_LIMIT
        })

        const userJobs = await businessService.addJobs(
          businessQueue,
          'user',
          queueUsers.users.map((user) => user.id),
          heartbeatJob,
          logger
        )

        step = 'queue-plans'
        await heartbeatJob.updateData({
          step
        })

        businessJobs.concat(userJobs)

        break
      }

      case 'queue-plans': {
        const { plans } = await planService.queuePlans(db, {
          limit: config.HEARTBEAT_QUEUE_PLANS_LIMIT
        })

        const planJobs = await businessService.addJobs(
          businessQueue,
          'plan',
          plans.map((plan) => plan.id),
          heartbeatJob,
          logger
        )

        step = 'queue-subscriptions'
        await heartbeatJob.updateData({
          step
        })

        businessJobs.concat(planJobs)

        break
      }

      case 'queue-subscriptions': {
        const { subscriptions } = await subscriptionService.queueSubscriptions(db, {
          limit: config.HEARTBEAT_QUEUE_SUBSCRIPTIONS_LIMIT
        })

        const subscriptionJobs = await businessService.addJobs(
          businessQueue,
          'subscription',
          subscriptions.map((subscription) => subscription.id),
          heartbeatJob,
          logger
        )

        step = 'queue-categories'
        await heartbeatJob.updateData({
          step
        })

        businessJobs.concat(subscriptionJobs)

        break
      }

      case 'queue-categories': {
        const { categories } = await categoryService.queueCategories(db, {
          limit: config.HEARTBEAT_QUEUE_CATEGORIES_LIMIT
        })

        const categoryJobs = await businessService.addJobs(
          businessQueue,
          'category',
          categories.map((category) => category.id),
          heartbeatJob,
          logger
        )

        step = 'wait-results'
        await heartbeatJob.updateData({
          step
        })

        businessJobs.concat(categoryJobs)

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

        step = 'check-scraper-jobs'
        await heartbeatJob.updateData({
          step
        })

        break
      }

      case 'check-scraper-jobs': {
        const repeatableJobs = await scraperQueue.getRepeatableJobs()

        const listedScrapers = await cacheService.listScrapers(redis, {
          //
        })

        const orphanScraperJobs = repeatableJobs
          .filter((repeatableJob) => !listedScrapers.jobIds.includes(repeatableJob.id))

        for (const orphanScraperJob of orphanScraperJobs) {
          await scraperQueue.removeRepeatableByKey(orphanScraperJob.key)

          logger.info(`Scraper removed orphan job`)
        }

        for (const scraperJobId of listedScrapers.jobIds) {
          const existsScrapperJob = repeatableJobs
            .find((repeatableJob) =>
              repeatableJob.id !== undefined && repeatableJob.id === scraperJobId
            )

          if (existsScrapperJob !== undefined) {
            const { repeat } = existsScrapperJob.opts

            if (listedScrapers.minIntervalSec === undefined) {
              await scraperQueue.removeRepeatableByKey(scraperJob.key)
            
              const deletedScraper = await cacheService.deleteScraper(redis, {
                scrapperJobId
              })

              logger.info(`Scraper removed job`)
            } else {
              if (intervalSec < repeat.every) {
                await scraperQueue.removeRepeatableByKey(scraperJob.key)

                await scraperQueue.addJob()

                logger.info(`Scraper replace job`)
              } else {

                logger.info(`Scraper check job`)
              }
            }
          } else {
            await scraperQueue.addJob()

            logger.info(`Scraper added job`)
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
