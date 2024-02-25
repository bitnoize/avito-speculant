import { command, positional, option, number } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { databaseService, userLogService } from '@avito-speculant/database'
import { DEFAULT_LIMIT, Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
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
      const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
      const db = databaseService.initDatabase(databaseConfig, logger)

      const response = await userLogService.listUserLogs(db, {
        userId: args.userId,
        limit: args.limit
      })

      logger.info(response)

      await db.destroy()
    }
  })
}
