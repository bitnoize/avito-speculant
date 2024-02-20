import { command, positional, option, number } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { databaseService, subscriptionLogService } from '@avito-speculant/database'
import { DEFAULT_LIMIT, Config } from '../manager.js'

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
        long: 'limit',
        defaultValue: () => DEFAULT_LIMIT,
        defaultValueIsSerializable: true
      })
    },
    handler: async (args) => {
      const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
      const db = databaseService.initDatabase(databaseConfig, logger)

      const response = await subscriptionLogService.listSubscriptionLogs(db, {
        subscriptionId: args.subscriptionId,
        limit: args.limit
      })

      logger.info(response)

      await databaseService.closeDatabase(db, logger)
    }
  })
}
