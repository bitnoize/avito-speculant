import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { redisService, userCacheService } from '@avito-speculant/redis'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'database-list-users-cache',
    description: 'Redis list users cache',
    args: {},
    handler: async () => {
      const redisOptions = redisService.getRedisOptions<Config>(config)
      const redis = redisService.initRedis(redisOptions, logger)

      const listedUsersCache = await userCacheService.listUsersCache(redis)
      logger.info(listedUsersCache)

      await redisService.closeRedis(redis)
    }
  })
}
