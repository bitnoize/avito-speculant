import { command, positional, option } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { databaseService, proxyLogService } from '@avito-speculant/database'
import { Config, InitCommand, DEFAULT_LIMIT } from '../manager.js'
import { Serial, Limit } from '../manager.utils.js'

const initCommand: InitCommand = (config, logger) => {
  return command({
    name: 'database-proxy-logs-list',
    description: 'list proxy logs',
    args: {
      proxyId: positional({
        type: Serial,
        displayName: 'proxyId',
        description: 'proxy identifier'
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
    handler: async ({ proxyId, limit }) => {
      const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
      const db = databaseService.initDatabase(databaseConfig, logger)

      try {
        const { proxyLogs } = await proxyLogService.listProxyLogs(db, {
          proxyId,
          limit
        })

        logger.info({ proxyLogs }, `ProxyLogs listed`)
      } finally {
        await databaseService.closeDatabase(db)
      }
    }
  })
}

export default initCommand
