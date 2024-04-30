import { command, positional, option } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { databaseService, subscriptionLogService } from '@avito-speculant/database'
import { Config, InitCommand, DEFAULT_LIMIT } from '../manager.js'
import { Serial, Limit } from '../manager.utils.js'

const initCommand: InitCommand = (config, logger) => {
  return command({
    name: 'database-subscription-logs-list',
    description: 'list subscription logs',
    args: {
      subscriptionId: positional({
        type: Serial,
        displayName: 'subscriptionId',
        description: 'subscription identifier'
      }),
      limit: option({
        type: Limit,
        long: 'limit',
        short: 'l',
        description: 'logs per list',
        defaultValue: () => DEFAULT_LIMIT,
        defaultValueIsSerializable: true
      })
    },
    handler: async ({ subscriptionId, limit }) => {
      const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
      const db = databaseService.initDatabase(databaseConfig, logger)

      try {
        const { subscriptionLogs } = await subscriptionLogService.listSubscriptionLogs(db, {
          subscriptionId,
          limit
        })

        logger.info({ subscriptionLogs }, `SubscriptionLogs listed`)
      } finally {
        await databaseService.closeDatabase(db)
      }
    }
  })
}

export default initCommand
