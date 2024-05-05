import { command, flag, boolean } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { databaseService, proxyService } from '@avito-speculant/database'
import { Config, InitCommand } from '../manager.js'

const initCommand: InitCommand = (config, logger) => {
  return command({
    name: 'database-proxies-list',
    description: 'list proxies',
    args: {},
    handler: async () => {
      const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
      const db = databaseService.initDatabase(databaseConfig, logger)

      try {
        const { proxies } = await proxyService.listProxies(db)

        logger.info({ proxies }, `Proxies listed`)
      } finally {
        await databaseService.closeDatabase(db)
      }
    }
  })
}

export default initCommand
