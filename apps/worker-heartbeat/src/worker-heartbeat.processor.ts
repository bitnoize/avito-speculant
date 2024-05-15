import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import {
  databaseService,
  userService,
  planService,
  subscriptionService,
  categoryService,
  proxyService,
  botService
} from '@avito-speculant/database'
import {
  TreatmentOverflowError,
  HeartbeatResult,
  HeartbeatProcessor,
  queueService,
  treatmentService
} from '@avito-speculant/queue'
import { Config, ProcessStep } from './worker-heartbeat.js'
import { configSchema } from './worker-heartbeat.schema.js'

const heartbeatProcessor: HeartbeatProcessor = async function (heartbeatJob) {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const heartbeatResult: HeartbeatResult = {}

  let { step } = heartbeatJob.data

  while (step !== 'complete') {
    switch (step) {
      case 'users': {
        await processUsers(config, logger, heartbeatJob, heartbeatResult)

        step = 'plans'
        await heartbeatJob.updateData({ step })

        break
      }

      case 'plans': {
        await processPlans(config, logger, heartbeatJob, heartbeatResult)

        step = 'subscriptions'
        await heartbeatJob.updateData({ step })

        break
      }

      case 'subscriptions': {
        await processSubscriptions(config, logger, heartbeatJob, heartbeatResult)

        step = 'bots'
        await heartbeatJob.updateData({ step })

        break
      }

      case 'bots': {
        await processBots(config, logger, heartbeatJob, heartbeatResult)

        step = 'categories'
        await heartbeatJob.updateData({ step })

        break
      }

      case 'categories': {
        await processCategories(config, logger, heartbeatJob, heartbeatResult)

        step = 'proxies'
        await heartbeatJob.updateData({ step })

        break
      }

      case 'proxies': {
        await processProxies(config, logger, heartbeatJob, heartbeatResult)

        step = 'complete'
        await heartbeatJob.updateData({ step })

        break
      }

      default: {
        throw new Error(`Processor step '${step}' unknown`)
      }
    }
  }

  return heartbeatResult
}

const processUsers: ProcessStep = async function (config, logger, heartbeatJob, heartbeatResult) {
  const startTime = Date.now()

  const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
  const db = databaseService.initDatabase(databaseConfig, logger)

  const queueConnection = queueService.getQueueConnection<Config>(config)
  const treatmentQueue = treatmentService.initQueue(queueConnection, logger)

  const { step } = heartbeatJob.data

  const heartbeatStepResult = (heartbeatResult[step] = {
    entities: 0,
    durationTime: 0
  })

  try {
    const jobsCount = await treatmentQueue.count()

    if (jobsCount > config.HEARTBEAT_FILLING_TREATMENT_MAX) {
      throw new TreatmentOverflowError({ step, jobsCount })
    }

    const { users } = await userService.produceUsers(db, {
      limit: config.HEARTBEAT_PRODUCE_USERS_LIMIT
    })

    await treatmentService.addJobs(
      treatmentQueue,
      'user',
      users.map((user) => user.id)
    )

    heartbeatStepResult.entities = users.length
  } finally {
    await treatmentService.closeQueue(treatmentQueue)
    await databaseService.closeDatabase(db)

    heartbeatStepResult.durationTime = Date.now() - startTime
  }
}

const processPlans: ProcessStep = async function (config, logger, heartbeatJob, heartbeatResult) {
  const startTime = Date.now()

  const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
  const db = databaseService.initDatabase(databaseConfig, logger)

  const queueConnection = queueService.getQueueConnection<Config>(config)
  const treatmentQueue = treatmentService.initQueue(queueConnection, logger)

  const { step } = heartbeatJob.data

  const heartbeatStepResult = (heartbeatResult[step] = {
    entities: 0,
    durationTime: 0
  })

  try {
    const jobsCount = await treatmentQueue.count()

    if (jobsCount > config.HEARTBEAT_FILLING_TREATMENT_MAX) {
      throw new TreatmentOverflowError({ step, jobsCount })
    }

    const { plans } = await planService.producePlans(db, {
      limit: config.HEARTBEAT_PRODUCE_PLANS_LIMIT
    })

    await treatmentService.addJobs(
      treatmentQueue,
      'plan',
      plans.map((plan) => plan.id)
    )

    heartbeatStepResult.entities = plans.length
  } finally {
    await treatmentService.closeQueue(treatmentQueue)
    await databaseService.closeDatabase(db)

    heartbeatStepResult.durationTime = Date.now() - startTime
  }
}

const processSubscriptions: ProcessStep = async function (
  config,
  logger,
  heartbeatJob,
  heartbeatResult
) {
  const startTime = Date.now()

  const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
  const db = databaseService.initDatabase(databaseConfig, logger)

  const queueConnection = queueService.getQueueConnection<Config>(config)
  const treatmentQueue = treatmentService.initQueue(queueConnection, logger)

  const { step } = heartbeatJob.data

  const heartbeatStepResult = (heartbeatResult[step] = {
    entities: 0,
    durationTime: 0
  })

  try {
    const jobsCount = await treatmentQueue.count()

    if (jobsCount > config.HEARTBEAT_FILLING_TREATMENT_MAX) {
      throw new TreatmentOverflowError({ step, jobsCount })
    }

    const { subscriptions } = await subscriptionService.produceSubscriptions(db, {
      limit: config.HEARTBEAT_PRODUCE_SUBSCRIPTIONS_LIMIT
    })

    await treatmentService.addJobs(
      treatmentQueue,
      'subscription',
      subscriptions.map((subscription) => subscription.id)
    )

    heartbeatStepResult.entities = subscriptions.length
  } finally {
    await treatmentService.closeQueue(treatmentQueue)
    await databaseService.closeDatabase(db)

    heartbeatStepResult.durationTime = Date.now() - startTime
  }
}

const processCategories: ProcessStep = async function (
  config,
  logger,
  heartbeatJob,
  heartbeatResult
) {
  const startTime = Date.now()

  const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
  const db = databaseService.initDatabase(databaseConfig, logger)

  const queueConnection = queueService.getQueueConnection<Config>(config)
  const treatmentQueue = treatmentService.initQueue(queueConnection, logger)

  const { step } = heartbeatJob.data

  const heartbeatStepResult = (heartbeatResult[step] = {
    entities: 0,
    durationTime: 0
  })

  try {
    const jobsCount = await treatmentQueue.count()

    if (jobsCount > config.HEARTBEAT_FILLING_TREATMENT_MAX) {
      throw new TreatmentOverflowError({ step, jobsCount })
    }

    const { categories } = await categoryService.produceCategories(db, {
      limit: config.HEARTBEAT_PRODUCE_CATEGORIES_LIMIT
    })

    await treatmentService.addJobs(
      treatmentQueue,
      'category',
      categories.map((category) => category.id)
    )

    heartbeatStepResult.entities = categories.length
  } finally {
    await treatmentService.closeQueue(treatmentQueue)
    await databaseService.closeDatabase(db)

    heartbeatStepResult.durationTime = Date.now() - startTime
  }
}

const processBots: ProcessStep = async function (config, logger, heartbeatJob, heartbeatResult) {
  const startTime = Date.now()

  const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
  const db = databaseService.initDatabase(databaseConfig, logger)

  const queueConnection = queueService.getQueueConnection<Config>(config)
  const treatmentQueue = treatmentService.initQueue(queueConnection, logger)

  const { step } = heartbeatJob.data

  const heartbeatStepResult = (heartbeatResult[step] = {
    entities: 0,
    durationTime: 0
  })

  try {
    const jobsCount = await treatmentQueue.count()

    if (jobsCount > config.HEARTBEAT_FILLING_TREATMENT_MAX) {
      throw new TreatmentOverflowError({ step, jobsCount })
    }

    const { bots } = await botService.produceBots(db, {
      limit: config.HEARTBEAT_PRODUCE_BOTS_LIMIT
    })

    await treatmentService.addJobs(
      treatmentQueue,
      'bot',
      bots.map((bot) => bot.id)
    )

    heartbeatStepResult.entities = bots.length
  } finally {
    await treatmentService.closeQueue(treatmentQueue)
    await databaseService.closeDatabase(db)

    heartbeatStepResult.durationTime = Date.now() - startTime
  }
}

const processProxies: ProcessStep = async function (config, logger, heartbeatJob, heartbeatResult) {
  const startTime = Date.now()

  const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
  const db = databaseService.initDatabase(databaseConfig, logger)

  const queueConnection = queueService.getQueueConnection<Config>(config)
  const treatmentQueue = treatmentService.initQueue(queueConnection, logger)

  const { step } = heartbeatJob.data

  const heartbeatStepResult = (heartbeatResult[step] = {
    entities: 0,
    durationTime: 0
  })

  try {
    const jobsCount = await treatmentQueue.count()

    if (jobsCount > config.HEARTBEAT_FILLING_TREATMENT_MAX) {
      throw new TreatmentOverflowError({ step, jobsCount })
    }

    const { proxies } = await proxyService.produceProxies(db, {
      limit: config.HEARTBEAT_PRODUCE_PROXIES_LIMIT
    })

    await treatmentService.addJobs(
      treatmentQueue,
      'proxy',
      proxies.map((proxy) => proxy.id)
    )

    heartbeatStepResult.entities = proxies.length
  } finally {
    await treatmentService.closeQueue(treatmentQueue)
    await databaseService.closeDatabase(db)

    heartbeatStepResult.durationTime = Date.now() - startTime
  }
}

export default heartbeatProcessor
