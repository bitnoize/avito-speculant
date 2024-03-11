import { command, positional, number } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { redisService, categoryCacheService } from '@avito-speculant/redis'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'database-list-user-categories-cache',
    description: 'Redis list user categories cache',
    args: {
      userId: positional({
        type: number,
        displayName: 'userId'
      })
    },
    handler: async ({ userId }) => {
      const redisOptions = redisService.getRedisOptions<Config>(config)
      const redis = redisService.initRedis(redisOptions, logger)

      const listedCategoriesCache = await categoryCacheService.listUserCategoriesCache(redis, {
        userId
      })
      logger.info(listedCategoriesCache)

      await redisService.closeRedis(redis)
    }
  })
}
