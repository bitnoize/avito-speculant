import { command, positional } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { databaseService, botService } from '@avito-speculant/database'
import { redisService } from '@avito-speculant/redis'
import { queueService, treatmentService } from '@avito-speculant/queue'
import { Config, InitCommand } from '../manager.js'
import { Serial } from '../manager.utils.js'

const initCommand: InitCommand = (config, logger) => {
  return command({
    name: 'database-bot-disable',
    description: 'disable user bot',
    args: {
      userId: positional({
        type: Serial,
        displayName: 'userId',
        description: `user identifier`
      }),
      botId: positional({
        type: Serial,
        displayName: 'botId',
        description: `bot identifier`
      })
    },
    handler: async ({ userId, botId }) => {
      const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
      const db = databaseService.initDatabase(databaseConfig, logger)

      const redisOptions = redisService.getRedisOptions<Config>(config)
      const pubSub = redisService.initPubSub(redisOptions, logger)

      const queueConnection = queueService.getQueueConnection<Config>(config)
      const treatmentQueue = treatmentService.initQueue(queueConnection, logger)

      try {
        const { user, bot, backLog } = await botService.disableBot(db, {
          userId,
          botId,
          data: {}
        })

        await redisService.publishBackLog(pubSub, backLog)

        await treatmentService.addJob(treatmentQueue, 'user', user.id)
        await treatmentService.addJob(treatmentQueue, 'bot', bot.id)

        logger.info({ user, bot, backLog }, `Bot disabled`)
      } finally {
        await treatmentService.closeQueue(treatmentQueue)
        await redisService.closePubSub(pubSub)
        await databaseService.closeDatabase(db)
      }
    }
  })
}

export default initCommand
