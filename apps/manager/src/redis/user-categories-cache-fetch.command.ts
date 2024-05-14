import { command, positional } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { redisService, categoryCacheService } from '@avito-speculant/redis'
import { Config, InitCommand } from '../manager.js'
import { Serial } from '../manager.utils.js'

const initCommand: InitCommand = (config, logger) => {
  return command({
    name: 'redis-user-categories-cache-fetch',
    description: 'fetch user categories cache',
    args: {
      userId: positional({
        type: Serial,
        displayName: 'userId',
        description: 'user identifier'
      })
    },
    handler: async ({ userId }) => {
      const redisOptions = redisService.getRedisOptions<Config>(config)
      const redis = redisService.initRedis(redisOptions, logger)

      try {
        const { categoriesCache } = await categoryCacheService.fetchUserCategoriesCache(redis, {
          userId
        })

        logger.info({ categoriesCache }, `CategoriesCache fetched`)
      } finally {
        await redisService.closeRedis(redis)
      }
    }
  })
}

export default initCommand
