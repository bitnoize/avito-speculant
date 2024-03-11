import { command, positional, number } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { redisService, subscriptionCacheService } from '@avito-speculant/redis'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'database-list-plan-subscriptions-cache',
    description: 'Redis list plan subscriptions cache',
    args: {
      planId: positional({
        type: number,
        displayName: 'planId'
      }),
    },
    handler: async ({ planId }) => {
      const redisOptions = redisService.getRedisOptions<Config>(config)
      const redis = redisService.initRedis(redisOptions, logger)

      const listedSubscriptionsCache =
        await subscriptionCacheService.listPlanSubscriptionsCache(redis, {
          planId
        })
      logger.info(listedSubscriptionsCache)

      await redisService.closeRedis(redis)
    }
  })
}
