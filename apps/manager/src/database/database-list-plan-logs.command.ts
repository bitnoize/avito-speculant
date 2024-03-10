import { command, positional, option, number } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { databaseService, planLogService } from '@avito-speculant/database'
import { Config } from '../manager.js'

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
        long: 'limit'
      })
    },
    handler: async ({ planId, limit }) => {
      const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
      const db = databaseService.initDatabase(databaseConfig, logger)

      const listedPlanLogs = await planLogService.listPlanLogs(db, {
        planId,
        limit
      })
      logger.info(listedPlanLogs)

      await databaseService.closeDatabase(db)
    }
  })
}
