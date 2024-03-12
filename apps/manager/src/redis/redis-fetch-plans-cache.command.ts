import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { redisService, planCacheService } from '@avito-speculant/redis'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'database-fetch-plans-cache',
    description: 'Redis fetch plans cache',
    args: {},
    handler: async () => {
      const redisOptions = redisService.getRedisOptions<Config>(config)
      const redis = redisService.initRedis(redisOptions, logger)

      const { plansCache } = await planCacheService.fetchPlansCache(redis)

      logger.info({ plansCache }, `PlansCache successfully fetched`)

      await redisService.closeRedis(redis)
    }
  })
}
