import { command, positional } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { databaseService, categoryService } from '@avito-speculant/database'
import { redisService } from '@avito-speculant/redis'
import { queueService, treatmentService } from '@avito-speculant/queue'
import { Config, InitCommand } from '../manager.js'
import { Serial } from '../manager.utils.js'

const initCommand: InitCommand = (config, logger) => {
  return command({
    name: 'database-category-enable',
    description: 'enable user category',
    args: {
      userId: positional({
        type: Serial,
        displayName: 'userId',
        description: 'user identifier'
      }),
      categoryId: positional({
        type: Serial,
        displayName: 'categoryId',
        description: 'category identifier'
      }),
      botId: positional({
        type: Serial,
        displayName: 'botId',
        description: 'bot identifier'
      })
    },
    handler: async ({ userId, categoryId, botId }) => {
      const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
      const db = databaseService.initDatabase(databaseConfig, logger)

      const redisOptions = redisService.getRedisOptions<Config>(config)
      const pubSub = redisService.initPubSub(redisOptions, logger)

      const queueConnection = queueService.getQueueConnection<Config>(config)
      const treatmentQueue = treatmentService.initQueue(queueConnection, logger)

      try {
        const { user, category, bot, backLog } = await categoryService.enableCategory(db, {
          userId,
          categoryId,
          botId,
          data: {
            message: `Enable category via Manager`
          }
        })

        await redisService.publishBackLog(pubSub, backLog)

        await treatmentService.addJob(treatmentQueue, 'user', user.id)
        await treatmentService.addJob(treatmentQueue, 'category', category.id)
        await treatmentService.addJob(treatmentQueue, 'bot', bot.id)

        logger.info({ user, category, bot, backLog }, `Category enabled`)
      } finally {
        await treatmentService.closeQueue(treatmentQueue)
        await redisService.closePubSub(pubSub)
        await databaseService.closeDatabase(db)
      }
    }
  })
}

export default initCommand
