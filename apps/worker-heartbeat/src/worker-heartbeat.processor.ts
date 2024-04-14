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
import { redisService, systemService } from '@avito-speculant/redis'
import {
  ProcessorUnknownStepError,
  HeartbeatResult,
  HeartbeatProcessor,
  queueService,
  treatmentService
} from '@avito-speculant/queue'
import { Config, StepProcessTreatment } from './worker-heartbeat.js'
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

  const heartbeatResult: HeartbeatResult = {}

  try {
    let { step } = heartbeatJob.data

    while (step !== 'complete') {
      switch (step) {
        case 'users': {
          const treatmentQueue = treatmentService.initQueue(queueConnection, logger)

          await processUsers(config, logger, db, heartbeatJob, heartbeatResult, treatmentQueue)

          step = 'plans'
          await heartbeatJob.updateData({ step })

          break
        }

        case 'plans': {
          const treatmentQueue = treatmentService.initQueue(queueConnection, logger)

          await processPlans(config, logger, db, heartbeatJob, heartbeatResult, treatmentQueue)

          step = 'subscriptions'
          await heartbeatJob.updateData({ step })

          break
        }

        case 'subscriptions': {
          const treatmentQueue = treatmentService.initQueue(queueConnection, logger)

          await processSubscriptions(
            config,
            logger,
            db,
            heartbeatJob,
            heartbeatResult,
            treatmentQueue
          )

          step = 'categories'
          await heartbeatJob.updateData({ step })

          break
        }

        case 'categories': {
          const treatmentQueue = treatmentService.initQueue(queueConnection, logger)

          await processCategories(config, logger, db, heartbeatJob, heartbeatResult, treatmentQueue)

          step = 'proxies'
          await heartbeatJob.updateData({ step })

          break
        }

        case 'proxies': {
          const treatmentQueue = treatmentService.initQueue(queueConnection, logger)

          await processProxies(config, logger, db, heartbeatJob, heartbeatResult, treatmentQueue)

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

  return heartbeatResult
}

const processUsers: StepProcessTreatment = async function (
  config,
  logger,
  db,
  heartbeatJob,
  heartbeatResult,
  treatmentQueue
) {
  try {
    const startTime = Date.now()
    const { step } = heartbeatJob.data

    const fillingCount = await treatmentQueue.count()
    if (fillingCount < config.HEARTBEAT_FILLING_TREATMENT_MAX) {
      const { users } = await userService.produceUsers(db, {
        limit: config.HEARTBEAT_PRODUCE_USERS_LIMIT
      })

      await treatmentService.addJobs(
        treatmentQueue,
        'user',
        users.map((user) => user.id)
      )

      heartbeatResult[step] = {
        produceCount: users.length,
        durationTime: Date.now() - startTime
      }
    } else {
      logger.warn(`HeartbeatProcessor processUsers overflow jobs`)

      heartbeatResult[step] = {
        produceCount: 0,
        durationTime: Date.now() - startTime
      }
    }
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

const processPlans: StepProcessTreatment = async function (
  config,
  logger,
  db,
  heartbeatJob,
  heartbeatResult,
  treatmentQueue
) {
  try {
    const startTime = Date.now()
    const { step } = heartbeatJob.data

    const fillingCount = await treatmentQueue.count()
    if (fillingCount < config.HEARTBEAT_FILLING_TREATMENT_MAX) {
      const { plans } = await planService.producePlans(db, {
        limit: config.HEARTBEAT_PRODUCE_PLANS_LIMIT
      })

      await treatmentService.addJobs(
        treatmentQueue,
        'plan',
        plans.map((plan) => plan.id)
      )

      heartbeatResult[step] = {
        produceCount: plans.length,
        durationTime: Date.now() - startTime
      }
    } else {
      logger.warn(`HeartbeatProcessor processPlans overflow jobs`)

      heartbeatResult[step] = {
        produceCount: 0,
        durationTime: Date.now() - startTime
      }
    }
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

const processSubscriptions: StepProcessTreatment = async function (
  config,
  logger,
  db,
  heartbeatJob,
  heartbeatResult,
  treatmentQueue
) {
  try {
    const startTime = Date.now()
    const { step } = heartbeatJob.data

    const fillingCount = await treatmentQueue.count()
    if (fillingCount < config.HEARTBEAT_FILLING_TREATMENT_MAX) {
      const { subscriptions } = await subscriptionService.produceSubscriptions(db, {
        limit: config.HEARTBEAT_PRODUCE_SUBSCRIPTIONS_LIMIT
      })

      await treatmentService.addJobs(
        treatmentQueue,
        'subscription',
        subscriptions.map((subscription) => subscription.id)
      )

      heartbeatResult[step] = {
        produceCount: subscriptions.length,
        durationTime: Date.now() - startTime
      }
    } else {
      logger.warn(`HeartbeatProcessor processSubscriptions overflow jobs`)

      heartbeatResult[step] = {
        produceCount: 0,
        durationTime: Date.now() - startTime
      }
    }
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

const processCategories: StepProcessTreatment = async function (
  config,
  logger,
  db,
  heartbeatJob,
  heartbeatResult,
  treatmentQueue
) {
  try {
    const startTime = Date.now()
    const { step } = heartbeatJob.data

    const fillingCount = await treatmentQueue.count()
    if (fillingCount < config.HEARTBEAT_FILLING_TREATMENT_MAX) {
      const { categories } = await categoryService.produceCategories(db, {
        limit: config.HEARTBEAT_PRODUCE_CATEGORIES_LIMIT
      })

      await treatmentService.addJobs(
        treatmentQueue,
        'category',
        categories.map((category) => category.id)
      )

      heartbeatResult[step] = {
        produceCount: categories.length,
        durationTime: Date.now() - startTime
      }
    } else {
      logger.warn(`HeartbeatProcessor processCategories overflow jobs`)

      heartbeatResult[step] = {
        produceCount: 0,
        durationTime: Date.now() - startTime
      }
    }
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

const processProxies: StepProcessTreatment = async function (
  config,
  logger,
  db,
  heartbeatJob,
  heartbeatResult,
  treatmentQueue
) {
  try {
    const startTime = Date.now()
    const { step } = heartbeatJob.data

    const fillingCount = await treatmentQueue.count()
    if (fillingCount < config.HEARTBEAT_FILLING_TREATMENT_MAX) {
      const { proxies } = await proxyService.produceProxies(db, {
        limit: config.HEARTBEAT_PRODUCE_PROXIES_LIMIT
      })

      await treatmentService.addJobs(
        treatmentQueue,
        'proxy',
        proxies.map((proxy) => proxy.id)
      )

      heartbeatResult[step] = {
        produceCount: proxies.length,
        durationTime: Date.now() - startTime
      }
    } else {
      logger.warn(`HeartbeatProcessor processProxies overflow jobs`)

      heartbeatResult[step] = {
        produceCount: 0,
        durationTime: Date.now() - startTime
      }
    }
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

export default heartbeatProcessor
