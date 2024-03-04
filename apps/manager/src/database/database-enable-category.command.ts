import { command, positional, number } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { databaseService, categoryService } from '@avito-speculant/database'
import { redisService } from '@avito-speculant/redis'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'database-enable-category',
    description: 'Database enable category',
    args: {
      categoryId: positional({
        type: number,
        displayName: 'categoryId'
      })
    },
    handler: async ({ categoryId }) => {
      const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
      const db = databaseService.initDatabase(databaseConfig, logger)

      const redisOptions = redisService.getRedisOptions<Config>(config)
      const pubSub = redisService.initPubSub(redisOptions, logger)

      const enabledCategory = await categoryService.enableCategory(db, {
        categoryId,
        data: {
          message: `Category enabled via Manager`
        }
      })

      logger.info(enabledCategory)

      await redisService.publishBackLog(pubSub, enabledCategory.backLog)

      await redisService.closePubSub(pubSub)
      await databaseService.closeDatabase(db)
    }
  })
}
