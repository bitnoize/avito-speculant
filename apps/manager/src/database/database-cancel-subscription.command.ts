import { command, positional, option, number } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { databaseService, subscriptionService } from '@avito-speculant/database'
import { redisService } from '@avito-speculant/redis'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'database-cancel-subscription',
    description: 'Database cancel subscription',
    args: {
      subscriptionId: positional({
        type: number,
        displayName: 'subscriptionId'
      })
    },
    handler: async ({ subscriptionId }) => {
      const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
      const db = databaseService.initDatabase(databaseConfig, logger)

      const redisOptions = redisService.getRedisOptions<Config>(config)
      const pubSub = redisService.initPubSub(redisOptions, logger)

      const cancelSubscription = await subscriptionService.cancelSubscription(db, {
        subscriptionId,
        data: {
          message: `Cancel Subscription via Manager`,
        }
      })

      logger.info(cancelSubscription)

      await redisService.publishBackLog(pubSub, cancelSubscription.backLog)

      await redisService.closePubSub(pubSub)
      await databaseService.closeDatabase(db)
    }
  })
}
