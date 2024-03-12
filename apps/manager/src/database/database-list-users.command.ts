import { command, flag, boolean } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { databaseService, userService } from '@avito-speculant/database'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'database-list-users',
    description: 'Database list users',
    args: {
      all: flag({
        type: boolean,
        long: 'all',
        defaultValue: () => false
        //defaultValueIsSerializable: true
      })
    },
    handler: async ({ all }) => {
      const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
      const db = databaseService.initDatabase(databaseConfig, logger)

      const { users } = await userService.listUsers(db, {
        all
      })

      logger.info({ users }, `Users successfully listed`)

      await databaseService.closeDatabase(db)
    }
  })
}
