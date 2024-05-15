import { command, positional, option } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { databaseService, botLogService } from '@avito-speculant/database'
import { Config, InitCommand, DEFAULT_LIMIT } from '../manager.js'
import { Serial, Limit } from '../manager.utils.js'

const initCommand: InitCommand = (config, logger) => {
  return command({
    name: 'database-bot-logs-list',
    description: 'list bot logs',
    args: {
      botId: positional({
        type: Serial,
        displayName: 'botId',
        description: 'bot identifier'
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
    handler: async ({ botId, limit }) => {
      const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
      const db = databaseService.initDatabase(databaseConfig, logger)

      try {
        const { botLogs } = await botLogService.listBotLogs(db, {
          botId,
          limit
        })

        logger.info({ botLogs }, `BotLogs listed`)
      } finally {
        await databaseService.closeDatabase(db)
      }
    }
  })
}

export default initCommand
