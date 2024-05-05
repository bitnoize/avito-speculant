import { command, positional } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { databaseService, planService } from '@avito-speculant/database'
import { Config, InitCommand } from '../manager.js'
import { Serial } from '../manager.utils.js'

const initCommand: InitCommand = (config, logger) => {
  return command({
    name: 'database-plan-read',
    description: 'read plan',
    args: {
      planId: positional({
        type: Serial,
        displayName: 'planId',
        description: 'plan identifier'
      }),
    },
    handler: async ({ planId }) => {
      const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
      const db = databaseService.initDatabase(databaseConfig, logger)

      try {
        const { plan } = await planService.readPlan(db, { planId })

        logger.info({ plan }, `Plan readed`)
      } finally {
        await databaseService.closeDatabase(db)
      }
    }
  })
}

export default initCommand
