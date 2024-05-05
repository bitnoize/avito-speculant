import { command, positional, flag, boolean } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { databaseService, subscriptionService } from '@avito-speculant/database'
import { Config, InitCommand } from '../manager.js'
import { Serial } from '../manager.utils.js'

const initCommand: InitCommand = (config, logger) => {
  return command({
    name: 'database-subscriptions-list',
    description: 'list user subscriptions',
    args: {
      userId: positional({
        type: Serial,
        displayName: 'userId',
        description: 'user identifier'
      })
    },
    handler: async ({ userId }) => {
      const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
      const db = databaseService.initDatabase(databaseConfig, logger)

      try {
        const { subscriptions } = await subscriptionService.listSubscriptions(db, {
          userId,
        })

        logger.info({ subscriptions }, `Subscriptions listed`)
      } finally {
        await databaseService.closeDatabase(db)
      }
    }
  })
}

export default initCommand
