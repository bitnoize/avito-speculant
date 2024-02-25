import { binary, subcommands, run } from 'cmd-ts'
import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { DomainError } from '@avito-speculant/domain'
import systemStartCommand from './system/system-start.command.js'
import systemStopCommand from './system/system-stop.command.js'
import systemStatusCommand from './system/system-status.command.js'
import databaseMigrationsCommand from './database/database-migrations.command.js'
import databaseListUsersCommand from './database/database-list-users.command.js'
import databaseListUserLogsCommand from './database/database-list-user-logs.command.js'
import databaseCreatePlanCommand from './database/database-create-plan.command.js'
import databaseUpdatePlanCommand from './database/database-update-plan.command.js'
import databaseEnablePlanCommand from './database/database-enable-plan.command.js'
import databaseDisablePlanCommand from './database/database-disable-plan.command.js'
import databaseListPlansCommand from './database/database-list-plans.command.js'
import databaseListPlanLogsCommand from './database/database-list-plan-logs.command.js'
import databaseListSubscriptionLogsCommand from './database/database-list-subscription-logs.command.js'
import databaseListCategoryLogsCommand from './database/database-list-category-logs.command.js'
import queueListenHeartbeatCommand from './queue/queue-listen-heartbeat.command.js'
import queueListenBusinessCommand from './queue/queue-listen-business.command.js'
import queueListenScraperCommand from './queue/queue-listen-scraper.command.js'
import queueListenProxycheckCommand from './queue/queue-listen-proxycheck.command.js'
import { Config } from './manager.js'
import { configSchema } from './manager.schema.js'

async function bootstrap(): Promise<void> {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const systemCommand = subcommands({
    name: 'system',
    cmds: {
      start: systemStartCommand(config, logger),
      stop: systemStopCommand(config, logger),
      status: systemStatusCommand(config, logger)
    }
  })

  const databaseCommand = subcommands({
    name: 'database',
    cmds: {
      migrations: databaseMigrationsCommand(config, logger),
      'list-users': databaseListUsersCommand(config, logger),
      'list-user-logs': databaseListUserLogsCommand(config, logger),
      'create-plan': databaseCreatePlanCommand(config, logger),
      'update-plan': databaseUpdatePlanCommand(config, logger),
      'enable-plan': databaseEnablePlanCommand(config, logger),
      'disable-plan': databaseDisablePlanCommand(config, logger),
      'list-plans': databaseListPlansCommand(config, logger),
      'list-plan-logs': databaseListPlanLogsCommand(config, logger),
      'list-subscription-logs': databaseListSubscriptionLogsCommand(config, logger),
      'list-category-logs': databaseListCategoryLogsCommand(config, logger)
    }
  })

  const queueCommand = subcommands({
    name: 'queue',
    cmds: {
      'listen-heartbeat': queueListenHeartbeatCommand(config, logger),
      'listen-business': queueListenBusinessCommand(config, logger),
      'listen-scraper': queueListenScraperCommand(config, logger),
      'listen-proxycheck': queueListenProxycheckCommand(config, logger)
    }
  })

  const app = subcommands({
    name: 'avito-speculant-manager',
    cmds: {
      system: systemCommand,
      database: databaseCommand,
      queue: queueCommand
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

bootstrap().catch((error) => {
  console.error(error)
  process.exit(1)
})
