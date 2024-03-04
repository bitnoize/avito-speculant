import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { databaseService } from '@avito-speculant/database'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'database-migrations',
    description: 'Apply last migrations to database',
    args: {},
    handler: async () => {
      const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
      const db = databaseService.initDatabase(databaseConfig, logger)

      await databaseService.migrateToLatest(db, logger)

      await databaseService.closeDatabase(db)
    }
  })
}
