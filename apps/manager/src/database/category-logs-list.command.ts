import { command, positional, option } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { databaseService, categoryLogService } from '@avito-speculant/database'
import { Config, InitCommand, DEFAULT_LIMIT } from '../manager.js'
import { Serial, Limit } from '../manager.utils.js'

const initCommand: InitCommand = (config, logger) => {
  return command({
    name: 'database-category-logs-list',
    description: 'list category logs',
    args: {
      categoryId: positional({
        type: Serial,
        displayName: 'categoryId',
        description: 'category identifier'
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
    handler: async ({ categoryId, limit }) => {
      const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
      const db = databaseService.initDatabase(databaseConfig, logger)

      try {
        const { categoryLogs } = await categoryLogService.listCategoryLogs(db, {
          categoryId,
          limit
        })

        logger.info({ categoryLogs }, `CategoryLogs listed`)
      } finally {
        await databaseService.closeDatabase(db)
      }
    }
  })
}

export default initCommand
