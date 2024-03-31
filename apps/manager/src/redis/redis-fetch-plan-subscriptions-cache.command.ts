import { command, positional, number } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { redisService, subscriptionCacheService } from '@avito-speculant/redis'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'redis-fetch-plan-subscriptions-cache',
    description: 'Redis fetch plan subscriptions cache',
    args: {
      planId: positional({
        type: number,
        displayName: 'planId'
      })
    },
    handler: async ({ planId }) => {
      const redisOptions = redisService.getRedisOptions<Config>(config)
      const redis = redisService.initRedis(redisOptions, logger)

      const { subscriptionsCache } = await subscriptionCacheService.fetchPlanSubscriptionsCache(
        redis,
        {
          planId
        }
      )

      logger.info({ subscriptionsCache }, `SubscriptionsCache successfully fetched`)

      await redisService.closeRedis(redis)
    }
  })
}
