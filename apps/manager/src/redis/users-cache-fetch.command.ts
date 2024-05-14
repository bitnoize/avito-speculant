import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { redisService, userCacheService } from '@avito-speculant/redis'
import { Config, InitCommand } from '../manager.js'

const initCommand: InitCommand = (config, logger) => {
  return command({
    name: 'redis-users-cache-fetch',
    description: 'fetch users cache',
    args: {},
    handler: async () => {
      const redisOptions = redisService.getRedisOptions<Config>(config)
      const redis = redisService.initRedis(redisOptions, logger)

      try {
        const { usersCache } = await userCacheService.fetchUsersCache(redis)

        logger.info({ usersCache }, `UsersCache fetched`)
      } finally {
        await redisService.closeRedis(redis)
      }
    }
  })
}

export default initCommand
