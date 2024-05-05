import { command, positional, option, string } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { databaseService, categoryService } from '@avito-speculant/database'
import { redisService } from '@avito-speculant/redis'
import { queueService, treatmentService } from '@avito-speculant/queue'
import { Config, InitCommand } from '../manager.js'
import { Serial } from '../manager.utils.js'

const initCommand: InitCommand = (config, logger) => {
  return command({
    name: 'database-category-create',
    description: 'create user category',
    args: {
      userId: positional({
        type: Serial,
        displayName: 'userId',
        description: 'user identifier'
      }),
      urlPath: option({
        type: string,
        long: 'url-path',
        short: 'p',
        description: 'avito url path'
      })
    },
    handler: async ({ userId, urlPath }) => {
      const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
      const db = databaseService.initDatabase(databaseConfig, logger)

      const redisOptions = redisService.getRedisOptions<Config>(config)
      const pubSub = redisService.initPubSub(redisOptions, logger)

      const queueConnection = queueService.getQueueConnection<Config>(config)
      const treatmentQueue = treatmentService.initQueue(queueConnection, logger)

      try {
        const { category, backLog } = await categoryService.createCategory(db, {
          userId,
          urlPath,
          data: {
            message: `Create category via Manager`
          }
        })

        await redisService.publishBackLog(pubSub, backLog)

        await treatmentService.addJob(treatmentQueue, 'category', category.id)

        logger.info({ category, backLog }, `Category created`)
      } finally {
        await treatmentService.closeQueue(treatmentQueue)
        await redisService.closePubSub(pubSub)
        await databaseService.closeDatabase(db)
      }
    }
  })
}

export default initCommand
