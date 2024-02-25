import { command, positional, option, number } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { databaseService, planLogService } from '@avito-speculant/database'
import { DEFAULT_LIMIT, Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'database-list-plan-logs',
    description: 'Database list plan logs',
    args: {
      planId: positional({
        type: number,
        displayName: 'planId'
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

      const response = await planLogService.listPlanLogs(db, {
        planId: args.planId,
        limit: args.limit
      })

      logger.info(response)

      await db.destroy()
    }
  })
}
