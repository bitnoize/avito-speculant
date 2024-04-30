import { command, positional, flag, boolean } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { databaseService, categoryService } from '@avito-speculant/database'
import { Config, InitCommand } from '../manager.js'
import { Serial } from '../manager.utils.js'

const initCommand: InitCommand = (config, logger) => {
  return command({
    name: 'database-categories-list',
    description: 'list user categories',
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
        const { categories } = await categoryService.listCategories(db, { userId })

        logger.info({ categories }, `Categories listed`)
      } finally {
        await databaseService.closeDatabase(db)
      }
    }
  })
}

export default initCommand
