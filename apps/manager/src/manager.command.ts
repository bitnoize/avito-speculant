import { binary, command, subcommands, run } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import {
  KyselyDatabase,
  databaseService,
  planService
} from '@avito-speculant/database'
import { Redis, redisService } from '@avito-speculant/redis'
import { SchedulerQueue, schedulerService } from '@avito-speculant/queue'
import { Config } from './manager.js'

export async function startApp(
  config: Config,
  logger: Logger,
  db: KyselyDatabase,
  redis: Redis,
  pubSub: Redis,
  scheduler: SchedulerQueue
): Promise<void> {
  const startSystemCommand = command({
    name: 'start-system',
    description: 'Start system',
    args: {},
    handler: async (args) => {
      const job = await schedulerService.addRepeatableJob(scheduler)

      logger.info({ state: await job.getState() }, `Scheduler repeatable job added`)
    }
  })

  const stopSystemCommand = command({
    name: 'stop-system',
    description: 'Stop system',
    args: {},
    handler: async (args) => {
      const jobs = await scheduler.getRepeatableJobs()

      for (const job of jobs) {
        logger.info(job, `Repeatable jobs now destroy`)

        scheduler.removeRepeatableByKey(job.key)
      }
    }
  })

  const statusSystemCommand = command({
    name: 'status-system',
    description: 'Status system',
    args: {},
    handler: async (args) => {
      const jobs = await scheduler.getRepeatableJobs()

      for (const job of jobs) {
        logger.info(job, `Repeatable job dumped`)
      }
    }
  })

  const systemCommand = subcommands({
    name: 'system',
    cmds: {
      start: startSystemCommand,
      stop: stopSystemCommand,
      status: statusSystemCommand,
    }
  })

  const migrationsDatabaseCommand = command({
    name: 'migrations-database',
    description: 'Apply last database migrations',
    args: {},
    handler: async (args) => {
      await databaseService.migrateToLatest(db, logger)
    }
  })

  const createPlanDatabaseCommand = command({
    name: 'create-plan-database',
    description: 'Create Plan Database',
    args: {},
    handler: async (args) => {
      const createPlanResponse = await planService.createPlan(
        db,
        {
          categoriesMax: 3,
          priceRub: 100,
          durationDays: 3,
          intervalSec: 1,
          analyticsOn: true,
          data: {
            foo: 'bar'
          }
        }
      )

      await redisService.publishBackLog(
        pubSub,
        logger,
        createPlanResponse.backLog
      )

      logger.info(createPlanResponse)
    }
  })

  const listPlansDatabaseCommand = command({
    name: 'list-plans-database',
    description: 'List Plans Database',
    args: {},
    handler: async (args) => {
      const response = await planService.listPlans(db, {})

      logger.info(response)
    }
  })

  const databaseCommand = subcommands({
    name: 'database',
    cmds: {
      'migrations': migrationsDatabaseCommand,
      'create-plan': createPlanDatabaseCommand,
      'list-plans': listPlansDatabaseCommand,
    }
  })

  const app = subcommands({
    name: 'manager',
    cmds: {
      system: systemCommand,
      database: databaseCommand,
    }
  })

  const binaryApp = binary(app)
  await run(binaryApp, process.argv)
}
