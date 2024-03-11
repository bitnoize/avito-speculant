import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { redisService, planCacheService } from '@avito-speculant/redis'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'database-list-plans-cache',
    description: 'Redis list plans cache',
    args: {},
    handler: async () => {
      const redisOptions = redisService.getRedisOptions<Config>(config)
      const redis = redisService.initRedis(redisOptions, logger)

      const listedPlansCache = await planCacheService.listPlansCache(redis)
      logger.info(listedPlansCache)

      await redisService.closeRedis(redis)
    }
  })
}
