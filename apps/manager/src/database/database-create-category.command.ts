import { command, positional, option, number, string } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { databaseService, categoryService } from '@avito-speculant/database'
import { redisService } from '@avito-speculant/redis'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'database-create-category',
    description: 'Database create category',
    args: {
      userId: positional({
        type: number,
        displayName: 'userId'
      }),
      avitoUrl: option({
        type: string,
        long: 'avito-url'
      })
    },
    handler: async ({ userId, avitoUrl }) => {
      const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
      const db = databaseService.initDatabase(databaseConfig, logger)

      const redisOptions = redisService.getRedisOptions<Config>(config)
      const pubSub = redisService.initPubSub(redisOptions, logger)

      const createdCategory = await categoryService.createCategory(db, {
        userId,
        avitoUrl,
        data: {
          message: `Category created via Manager`,
        }
      })

      logger.info(createdCategory)

      await redisService.publishBackLog(pubSub, createdCategory.backLog)

      await redisService.closePubSub(pubSub)
      await databaseService.closeDatabase(db)
    }
  })
}
