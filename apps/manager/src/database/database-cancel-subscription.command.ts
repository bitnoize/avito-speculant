import { command, positional, number } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { databaseService, subscriptionService } from '@avito-speculant/database'
import { redisService } from '@avito-speculant/redis'
import { queueService, businessService } from '@avito-speculant/queue'
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

      const queueConnection = queueService.getQueueConnection<Config>(config)
      const businessQueue = businessService.initQueue(queueConnection, logger)

      const { subscription, backLog } = await subscriptionService.cancelSubscription(db, {
        subscriptionId,
        data: {
          message: `Cancel Subscription via Manager`
        }
      })

      await redisService.publishBackLog(pubSub, backLog)

      await businessService.addJob(businessQueue, 'subscription', subscription.id)

      logger.info({ subscription, backLog }, `Subscription successfully canceled`)

      await businessService.closeQueue(businessQueue)
      await redisService.closePubSub(pubSub)
      await databaseService.closeDatabase(db)
    }
  })
}
