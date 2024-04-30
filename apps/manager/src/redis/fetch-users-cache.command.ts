import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { redisService, userCacheService } from '@avito-speculant/redis'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'redis-fetch-users-cache',
    description: 'Redis fetch users cache',
    args: {},
    handler: async () => {
      const redisOptions = redisService.getRedisOptions<Config>(config)
      const redis = redisService.initRedis(redisOptions, logger)

      const { usersCache } = await userCacheService.fetchUsersCache(redis, undefined)

      logger.info({ usersCache }, `UsersCache fetched`)

      await redisService.closeRedis(redis)
    }
  })
}
