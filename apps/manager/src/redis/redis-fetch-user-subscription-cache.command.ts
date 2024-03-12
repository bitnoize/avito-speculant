import { command, positional, number } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { redisService, subscriptionCacheService } from '@avito-speculant/redis'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'database-fetch-user-subscription-cache',
    description: 'Redis fetch user subscription cache',
    args: {
      userId: positional({
        type: number,
        displayName: 'userId'
      })
    },
    handler: async ({ userId }) => {
      const redisOptions = redisService.getRedisOptions<Config>(config)
      const redis = redisService.initRedis(redisOptions, logger)

      const { subscriptionCache } =
        await subscriptionCacheService.fetchUserSubscriptionCache(redis, {
          userId
        })

      logger.info({ subscriptionCache, userId }, `SubscriptionCache successfully fetched`)

      await redisService.closeRedis(redis)
    }
  })
}
