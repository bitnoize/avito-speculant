import { command, positional, option, number } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { databaseService, subscriptionService } from '@avito-speculant/database'
import { redisService } from '@avito-speculant/redis'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'database-create-subscription',
    description: 'Database create subscription',
    args: {
      userId: positional({
        type: number,
        displayName: 'userId'
      }),
      planId: positional({
        type: number,
        displayName: 'planId'
      })
    },
    handler: async ({ userId, planId }) => {
      const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
      const db = databaseService.initDatabase(databaseConfig, logger)

      const redisOptions = redisService.getRedisOptions<Config>(config)
      const pubSub = redisService.initPubSub(redisOptions, logger)

      const createdSubscription = await subscriptionService.createSubscription(db, {
        userId,
        planId,
        data: {
          message: `Subscription created via Manager`,
        }
      })

      logger.info(createdSubscription)

      await redisService.publishBackLog(pubSub, createdSubscription.backLog)

      await redisService.closePubSub(pubSub)
      await databaseService.closeDatabase(db)
    }
  })
}
