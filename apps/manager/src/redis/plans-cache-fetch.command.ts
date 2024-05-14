import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { redisService, planCacheService } from '@avito-speculant/redis'
import { Config, InitCommand } from '../manager.js'

const initCommand: InitCommand = (config, logger) => {
  return command({
    name: 'redis-plans-cache-fetch',
    description: 'fetch plans cache',
    args: {},
    handler: async () => {
      const redisOptions = redisService.getRedisOptions<Config>(config)
      const redis = redisService.initRedis(redisOptions, logger)

      try {
        const { plansCache } = await planCacheService.fetchPlansCache(redis)

        logger.info({ plansCache }, `PlansCache fetched`)
      } finally {
        await redisService.closeRedis(redis)
      }
    }
  })
}

export default initCommand
