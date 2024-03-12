import { command, positional, option, number } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { databaseService, proxyLogService } from '@avito-speculant/database'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'database-list-proxy-logs',
    description: 'Database list proxy logs',
    args: {
      proxyId: positional({
        type: number,
        displayName: 'proxyId'
      }),
      limit: option({
        type: number,
        long: 'limit'
      })
    },
    handler: async ({ proxyId, limit }) => {
      const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
      const db = databaseService.initDatabase(databaseConfig, logger)

      const { proxyLogs } = await proxyLogService.listProxyLogs(db, {
        proxyId,
        limit
      })

      logger.info({ proxyLogs }, `ProxyLogs successfully listed`)

      await databaseService.closeDatabase(db)
    }
  })
}
