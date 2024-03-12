import { command, flag, boolean } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { databaseService, proxyService } from '@avito-speculant/database'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'database-list-proxies',
    description: 'Database list proxies',
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

      const { proxies } = await proxyService.listProxies(db, { all })

      logger.info({ proxies }, `Proxies successfully listed`)

      await databaseService.closeDatabase(db)
    }
  })
}
