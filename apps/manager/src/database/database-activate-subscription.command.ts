import { command, positional, number } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { databaseService, subscriptionService } from '@avito-speculant/database'
import { redisService } from '@avito-speculant/redis'
import { queueService, businessService } from '@avito-speculant/queue'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'database-activate-subscription',
    description: 'Database activate subscription',
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

      const activatedSubscription = await subscriptionService.activateSubscription(db, {
        subscriptionId,
        data: {
          message: `Activate Subscription and User via Manager`
        }
      })
      logger.info(activatedSubscription)

      const { subscription, user, backLog } = activatedSubscription

      await redisService.publishBackLog(pubSub, backLog)

      await businessService.addJob(businessQueue, 'subscription', subscription.id)
      await businessService.addJob(businessQueue, 'user', user.id)

      await businessService.closeQueue(businessQueue)
      await redisService.closePubSub(pubSub)
      await databaseService.closeDatabase(db)
    }
  })
}
