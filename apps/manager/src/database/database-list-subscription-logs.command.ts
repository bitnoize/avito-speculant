import { command, positional, option, number } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { databaseService, subscriptionLogService } from '@avito-speculant/database'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'database-list-subscription-logs',
    description: 'Database list subscription logs',
    args: {
      subscriptionId: positional({
        type: number,
        displayName: 'subscriptionId'
      }),
      limit: option({
        type: number,
        long: 'limit'
      })
    },
    handler: async ({ subscriptionId, limit }) => {
      const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
      const db = databaseService.initDatabase(databaseConfig, logger)

      const listedSubscriptionLogs = await subscriptionLogService.listSubscriptionLogs(db, {
        subscriptionId,
        limit
      })
      logger.info(listedSubscriptionLogs)

      await databaseService.closeDatabase(db)
    }
  })
}
