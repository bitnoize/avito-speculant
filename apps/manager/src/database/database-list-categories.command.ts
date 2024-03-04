import { command, positional, option, flag, number, boolean } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { databaseService, categoryService } from '@avito-speculant/database'
import { DEFAULT_LIMIT, Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'database-list-categories',
    description: 'Database list categories by user',
    args: {
      userId: positional({
        type: number,
        displayName: 'userId'
      }),
      all: flag({
        type: boolean,
        long: 'all',
        defaultValue: () => true
        //defaultValueIsSerializable: true
      })
    },
    handler: async ({ userId, all }) => {
      const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
      const db = databaseService.initDatabase(databaseConfig, logger)

      const listedCategories = await categoryService.listCategories(db, {
        userId,
        all
      })

      logger.info(listedCategories)

      await databaseService.closeDatabase(db)
    }
  })
}
