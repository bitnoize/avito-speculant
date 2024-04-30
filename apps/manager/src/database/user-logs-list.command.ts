import { command, positional, option } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { databaseService, userLogService } from '@avito-speculant/database'
import { Config, InitCommand, DEFAULT_LIMIT } from '../manager.js'
import { Serial, Limit } from '../manager.utils.js'

const initCommand: InitCommand = (config, logger) => {
  return command({
    name: 'database-user-logs-list',
    description: 'list user logs',
    args: {
      userId: positional({
        type: Serial,
        displayName: 'userId',
        description: `user identifier`
      }),
      limit: option({
        type: Limit,
        long: 'limit',
        short: 'l',
        description: `logs per list`,
        defaultValue: () => DEFAULT_LIMIT,
        defaultValueIsSerializable: true
      })
    },
    handler: async ({ userId, limit }) => {
      const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
      const db = databaseService.initDatabase(databaseConfig, logger)

      try {
        const { userLogs } = await userLogService.listUserLogs(db, { userId, limit })

        logger.info({ userLogs }, `UserLogs listed`)
      } finally {
        await databaseService.closeDatabase(db)
      }
    }
  })
}

export default initCommand
