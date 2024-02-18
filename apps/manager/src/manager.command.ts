import {
  binary,
  command,
  subcommands,
  run,
  positional,
  optional,
  boolean,
  number,
  string,
  option,
  flag
} from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { DomainError } from '@avito-speculant/domain'
import {
  KyselyDatabase,
  databaseService,
  userService,
  userLogService,
  planService,
  planLogService,
  subscriptionService,
  subscriptionLogService,
  categoryService,
  categoryLogService
} from '@avito-speculant/database'
import { Redis, redisService } from '@avito-speculant/redis'
import { SchedulerQueue, schedulerService } from '@avito-speculant/queue'
import { DEFAULT_LIMIT, Config } from './manager.js'

/*
 * Start App
 */
export async function startApp(
  config: Config,
  logger: Logger,
  db: KyselyDatabase,
  redis: Redis,
  pubSub: Redis,
  scheduler: SchedulerQueue
): Promise<void> {
  //
  // System
  //

  const systemStart = command({
    name: 'system-start',
    description: 'Jump up to running state',
    args: {},
    handler: async () => {
      const job = await schedulerService.addRepeatableJob(scheduler)

      logger.info(job, `Scheduler repeatable job added`)
    }
  })

  const systemStop = command({
    name: 'system-stop',
    description: 'Stop running state',
    args: {},
    handler: async () => {
      const jobs = await scheduler.getRepeatableJobs()

      for (const job of jobs) {
        logger.info(job, `Repeatable job now destroed`)

        scheduler.removeRepeatableByKey(job.key)
      }
    }
  })

  const systemStatus = command({
    name: 'system-status',
    description: 'Display system status',
    args: {},
    handler: async () => {
      const jobs = await scheduler.getRepeatableJobs()

      for (const job of jobs) {
        logger.info(job, `Repeatable job dumped`)
      }
    }
  })

  const system = subcommands({
    name: 'system',
    cmds: {
      start: systemStart,
      stop: systemStop,
      status: systemStatus
    }
  })

  //
  // Database Migrations
  //

  const databaseMigrations = command({
    name: 'database-migrations',
    description: 'Apply last migrations to database',
    args: {},
    handler: async () => {
      await databaseService.migrateToLatest(db, logger)
    }
  })

  //
  // Database User
  //

  const databaseListUserLogs = command({
    name: 'database-list-user-logs',
    description: 'Database list user logs',
    args: {
      userId: positional({
        type: number,
        displayName: 'userId'
      }),
      limit: option({
        type: number,
        long: 'limit',
        defaultValue: () => DEFAULT_LIMIT,
        defaultValueIsSerializable: true
      })
    },
    handler: async (args) => {
      const response = await userLogService.listUserLogs(db, {
        userId: args.userId,
        limit: args.limit
      })

      logger.info(response)
    }
  })

  //
  // Database Plan
  //

  const databaseCreatePlan = command({
    name: 'database-create-plan',
    description: 'Database create plan',
    args: {
      categoriesMax: option({
        type: number,
        long: 'categories-max'
      }),
      priceRub: option({
        type: number,
        long: 'price-rub'
      }),
      durationDays: option({
        type: number,
        long: 'duration-days'
      }),
      intervalSec: option({
        type: number,
        long: 'interval-sec'
      }),
      analyticsOn: option({
        type: number,
        long: 'analytics-on'
      })
    },
    handler: async (args) => {
      const response = await planService.createPlan(db, {
        categoriesMax: args.categoriesMax,
        priceRub: args.priceRub,
        durationDays: args.durationDays,
        intervalSec: args.intervalSec,
        analyticsOn: !!args.analyticsOn,
        data: {}
      })

      await redisService.publishBackLog(pubSub, logger, response.backLog)

      logger.info(response)
    }
  })

  const databaseUpdatePlan = command({
    name: 'database-update-plan',
    description: 'Database update plan',
    args: {
      categoriesMax: option({
        type: optional(number),
        long: 'categories-max'
      }),
      priceRub: option({
        type: optional(number),
        long: 'price-rub'
      }),
      durationDays: option({
        type: optional(number),
        long: 'duration-days'
      }),
      intervalSec: option({
        type: optional(number),
        long: 'interval-sec'
      }),
      analyticsOn: option({
        type: optional(number),
        long: 'analytics-on'
      }),
      planId: positional({
        type: number,
        displayName: 'planId'
      })
    },
    handler: async (args) => {
      const response = await planService.updatePlan(db, {
        id: args.planId,
        categoriesMax: args.categoriesMax,
        priceRub: args.priceRub,
        durationDays: args.durationDays,
        intervalSec: args.intervalSec,
        analyticsOn:
          args.analyticsOn === undefined ? undefined : !!args.analyticsOn,
        data: {}
      })

      await redisService.publishBackLog(pubSub, logger, response.backLog)

      logger.info(response)
    }
  })

  const databaseEnablePlan = command({
    name: 'database-enable-plan',
    description: 'Database enable plan',
    args: {
      planId: positional({
        type: number,
        displayName: 'planId'
      })
    },
    handler: async (args) => {
      const response = await planService.enablePlan(db, {
        id: args.planId,
        data: {}
      })

      await redisService.publishBackLog(pubSub, logger, response.backLog)

      logger.info(response)
    }
  })

  const databaseDisablePlan = command({
    name: 'database-disable-plan',
    description: 'Database disable plan',
    args: {
      planId: positional({
        type: number,
        displayName: 'planId'
      })
    },
    handler: async (args) => {
      const response = await planService.disablePlan(db, {
        id: args.planId,
        data: {}
      })

      await redisService.publishBackLog(pubSub, logger, response.backLog)

      logger.info(response)
    }
  })

  const databaseListPlans = command({
    name: 'database-list-plans',
    description: 'Database list plans',
    args: {
      all: flag({
        type: boolean,
        long: 'all',
        defaultValue: () => false
        //defaultValueIsSerializable: true
      })
    },
    handler: async (args) => {
      const response = await planService.listPlans(db, {
        all: args.all
      })

      logger.info(response)
    }
  })

  const databaseListPlanLogs = command({
    name: 'database-list-plan-logs',
    description: 'Database list plan logs',
    args: {
      planId: positional({
        type: number,
        displayName: 'planId'
      }),
      limit: option({
        type: number,
        long: 'limit',
        defaultValue: () => DEFAULT_LIMIT,
        defaultValueIsSerializable: true
      })
    },
    handler: async (args) => {
      const response = await planLogService.listPlanLogs(db, {
        planId: args.planId,
        limit: args.limit
      })

      logger.info(response)
    }
  })

  //
  // Database Subscription
  //

  const databaseListSubscriptionLogs = command({
    name: 'database-list-subscription-logs',
    description: 'Database list subscription logs',
    args: {
      subscriptionId: positional({
        type: number,
        displayName: 'subscriptionId'
      }),
      limit: option({
        type: number,
        long: 'limit',
        defaultValue: () => DEFAULT_LIMIT,
        defaultValueIsSerializable: true
      })
    },
    handler: async (args) => {
      const response = await subscriptionLogService.listSubscriptionLogs(db, {
        subscriptionId: args.subscriptionId,
        limit: args.limit
      })

      logger.info(response)
    }
  })

  //
  // Database Category
  //

  const databaseListCategoryLogs = command({
    name: 'database-list-category-logs',
    description: 'Database list category logs',
    args: {
      categoryId: positional({
        type: number,
        displayName: 'categoryId'
      }),
      limit: option({
        type: number,
        long: 'limit',
        defaultValue: () => DEFAULT_LIMIT,
        defaultValueIsSerializable: true
      })
    },
    handler: async (args) => {
      const response = await categoryLogService.listCategoryLogs(db, {
        categoryId: args.categoryId,
        limit: args.limit
      })

      logger.info(response)
    }
  })

  //
  // Database
  //

  const database = subcommands({
    name: 'database',
    cmds: {
      'migrations': databaseMigrations,
      'list-user-logs': databaseListUserLogs,
      'create-plan': databaseCreatePlan,
      'update-plan': databaseUpdatePlan,
      'enable-plan': databaseEnablePlan,
      'disable-plan': databaseDisablePlan,
      'list-plans': databaseListPlans,
      'list-plan-logs': databaseListPlanLogs,
      'list-subscription-logs': databaseListSubscriptionLogs,
      'list-category-logs': databaseListCategoryLogs
    }
  })

  //
  // App
  //

  const app = subcommands({
    name: 'manager',
    cmds: {
      system,
      database
    }
  })

  try {
    const binaryApp = binary(app)

    await run(binaryApp, process.argv)
  } catch (error) {
    if (error instanceof DomainError) {
      logger.error(
        {
          request: error.request,
          statusCode: error.statusCode
        },
        error.message
      )
    } else {
      logger.fatal(error.stack ?? error.message)
    }
  }
}
