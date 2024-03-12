import { command, positional, number } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { redisService, categoryCacheService } from '@avito-speculant/redis'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'database-fetch-user-categories-cache',
    description: 'Redis fetch user categories cache',
    args: {
      userId: positional({
        type: number,
        displayName: 'userId'
      })
    },
    handler: async ({ userId }) => {
      const redisOptions = redisService.getRedisOptions<Config>(config)
      const redis = redisService.initRedis(redisOptions, logger)

      const { categoriesCache } = await categoryCacheService.fetchUserCategoriesCache(redis, {
        userId
      })

      logger.info({ categoriesCache, userId }, `CategoriesCache successfully fetched`)

      await redisService.closeRedis(redis)
    }
  })
}
