import { command, positional, option, number } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { databaseService, categoryLogService } from '@avito-speculant/database'
import { DEFAULT_LIMIT, Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'database-list-category-logs',
    description: 'Database list category logs',
    args: {
      categoryId: positional({
        type: number,
        displayName: 'categoryId'
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

      const response = await categoryLogService.listCategoryLogs(db, {
        categoryId: args.categoryId,
        limit: args.limit
      })

      logger.info(response)

      await databaseService.closeDatabase(db, logger)
    }
  })
}
