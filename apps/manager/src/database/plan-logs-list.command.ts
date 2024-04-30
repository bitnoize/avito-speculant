import { command, positional, option } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { databaseService, planLogService } from '@avito-speculant/database'
import { Config, InitCommand, DEFAULT_LIMIT } from '../manager.js'
import { Serial, Limit } from '../manager.utils.js'

const initCommand: InitCommand = (config, logger) => {
  return command({
    name: 'database-plan-logs-list',
    description: 'list plan logs',
    args: {
      planId: positional({
        type: Serial,
        displayName: 'planId',
        description: 'plan identifier'
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
    handler: async ({ planId, limit }) => {
      const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
      const db = databaseService.initDatabase(databaseConfig, logger)

      try {
        const { planLogs } = await planLogService.listPlanLogs(db, { planId, limit })

        logger.info({ planLogs }, `PlanLogs listed`)
      } finally {
        await databaseService.closeDatabase(db)
      }
    }
  })
}

export default initCommand
