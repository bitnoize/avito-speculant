import { binary, subcommands, run } from 'cmd-ts'
import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { HighDatabaseError } from '@avito-speculant/database'
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
import databaseCreateSubscriptionCommand from './database/database-create-subscription.command.js'
import databaseActivateSubscriptionCommand from './database/database-activate-subscription.command.js'
import databaseCancelSubscriptionCommand from './database/database-cancel-subscription.command.js'
import databaseListSubscriptionsCommand from './database/database-list-subscriptions.command.js'
import databaseListSubscriptionLogsCommand from './database/database-list-subscription-logs.command.js'
import databaseCreateCategoryCommand from './database/database-create-category.command.js'
import databaseEnableCategoryCommand from './database/database-enable-category.command.js'
import databaseDisableCategoryCommand from './database/database-disable-category.command.js'
import databaseListCategoriesCommand from './database/database-list-categories.command.js'
import databaseListCategoryLogsCommand from './database/database-list-category-logs.command.js'
import databaseCreateProxyCommand from './database/database-create-proxy.command.js'
import databaseEnableProxyCommand from './database/database-enable-proxy.command.js'
import databaseDisableProxyCommand from './database/database-disable-proxy.command.js'
import databaseListProxiesCommand from './database/database-list-proxies.command.js'
import databaseListProxyLogsCommand from './database/database-list-proxy-logs.command.js'
import redisFetchUsersCacheCommand from './redis/redis-fetch-users-cache.command.js'
import redisFetchPlansCacheCommand from './redis/redis-fetch-plans-cache.command.js'
import redisFetchUserSubscriptionCacheCommand from './redis/redis-fetch-user-subscription-cache.command.js'
import redisFetchPlanSubscriptionsCacheCommand from './redis/redis-fetch-plan-subscriptions-cache.command.js'
import redisFetchUserCategoriesCacheCommand from './redis/redis-fetch-user-categories-cache.command.js'
import redisFetchScraperCategoriesCacheCommand from './redis/redis-fetch-scraper-categories-cache.command.js'
import redisFetchProxiesCacheCommand from './redis/redis-fetch-proxies-cache.command.js'
import redisFetchProxiesCacheOnlineCommand from './redis/redis-fetch-proxies-cache-online.command.js'
import redisFetchScrapersCacheCommand from './redis/redis-fetch-scrapers-cache.command.js'
import queueMonitorHeartbeatCommand from './queue/queue-monitor-heartbeat.command.js'
import queueMonitorBusinessCommand from './queue/queue-monitor-business.command.js'
import queueMonitorScraperCommand from './queue/queue-monitor-scraper.command.js'
import queueMonitorProxycheckCommand from './queue/queue-monitor-proxycheck.command.js'
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
      'create-subscription': databaseCreateSubscriptionCommand(config, logger),
      'activate-subscription': databaseActivateSubscriptionCommand(config, logger),
      'cancel-subscription': databaseCancelSubscriptionCommand(config, logger),
      'list-subscriptions': databaseListSubscriptionsCommand(config, logger),
      'list-subscription-logs': databaseListSubscriptionLogsCommand(config, logger),
      'create-category': databaseCreateCategoryCommand(config, logger),
      'enable-category': databaseEnableCategoryCommand(config, logger),
      'disable-category': databaseDisableCategoryCommand(config, logger),
      'list-categories': databaseListCategoriesCommand(config, logger),
      'list-category-logs': databaseListCategoryLogsCommand(config, logger),
      'create-proxy': databaseCreateProxyCommand(config, logger),
      'enable-proxy': databaseEnableProxyCommand(config, logger),
      'disable-proxy': databaseDisableProxyCommand(config, logger),
      'list-proxies': databaseListProxiesCommand(config, logger),
      'list-proxy-logs': databaseListProxyLogsCommand(config, logger)
    }
  })

  const redisCommand = subcommands({
    name: 'redis',
    cmds: {
      'fetch-users-cache': redisFetchUsersCacheCommand(config, logger),
      'fetch-plans-cache': redisFetchPlansCacheCommand(config, logger),
      'fetch-user-subscription-cache': redisFetchUserSubscriptionCacheCommand(config, logger),
      'fetch-plan-subscriptions-cache': redisFetchPlanSubscriptionsCacheCommand(config, logger),
      'fetch-user-categories-cache': redisFetchUserCategoriesCacheCommand(config, logger),
      'fetch-scraper-categories-cache': redisFetchScraperCategoriesCacheCommand(config, logger),
      'fetch-proxies-cache': redisFetchProxiesCacheCommand(config, logger),
      'fetch-proxies-cache-online': redisFetchProxiesCacheOnlineCommand(config, logger),
      'fetch-scrapers-cache': redisFetchScrapersCacheCommand(config, logger),
    }
  })

  const queueCommand = subcommands({
    name: 'queue',
    cmds: {
      'monitor-heartbeat': queueMonitorHeartbeatCommand(config, logger),
      'monitor-business': queueMonitorBusinessCommand(config, logger),
      'monitor-scraper': queueMonitorScraperCommand(config, logger),
      'monitor-proxycheck': queueMonitorProxycheckCommand(config, logger)
    }
  })

  const app = subcommands({
    name: 'avito-speculant-manager',
    cmds: {
      system: systemCommand,
      database: databaseCommand,
      redis: redisCommand,
      queue: queueCommand
    }
  })

  try {
    const binaryApp = binary(app)

    await run(binaryApp, process.argv)
  } catch (error) {
    if (error instanceof HighDatabaseError) {
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

    process.exit(1)
  }
}

bootstrap().catch((error) => {
  console.error(error)
  process.exit(1)
})
