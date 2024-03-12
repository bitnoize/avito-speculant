import { command, positional, option, number } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { databaseService, userLogService } from '@avito-speculant/database'
import { Config } from '../manager.js'

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
        long: 'limit'
      })
    },
    handler: async ({ userId, limit }) => {
      const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
      const db = databaseService.initDatabase(databaseConfig, logger)

      const { userLogs } = await userLogService.listUserLogs(db, {
        userId,
        limit
      })

      logger.info({ userLogs }, `UserLogs successfully listed`)

      await databaseService.closeDatabase(db)
    }
  })
}
