import { command, positional } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { databaseService, subscriptionService } from '@avito-speculant/database'
import { redisService } from '@avito-speculant/redis'
import { queueService, treatmentService } from '@avito-speculant/queue'
import { Config, InitCommand } from '../manager.js'
import { Serial } from '../manager.utils.js'

const initCommand: InitCommand = (config, logger) => {
  return command({
    name: 'database-subscription-activate',
    description: 'activate user subscription',
    args: {
      userId: positional({
        type: Serial,
        displayName: 'userId',
        description: `user identifier`
      }),
      subscriptionId: positional({
        type: Serial,
        displayName: 'subscriptionId',
        description: `subscription identifier`
      })
    },
    handler: async ({ userId, subscriptionId }) => {
      const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
      const db = databaseService.initDatabase(databaseConfig, logger)

      const redisOptions = redisService.getRedisOptions<Config>(config)
      const pubSub = redisService.initPubSub(redisOptions, logger)

      const queueConnection = queueService.getQueueConnection<Config>(config)
      const treatmentQueue = treatmentService.initQueue(queueConnection, logger)

      try {
        const { user, subscription, previousSubscription, backLog } =
          await subscriptionService.activateSubscription(db, {
            userId,
            subscriptionId,
            data: {}
          })

        await redisService.publishBackLog(pubSub, backLog)

        await treatmentService.addJob(treatmentQueue, 'user', user.id)
        await treatmentService.addJob(treatmentQueue, 'subscription', subscription.id)

        if (previousSubscription !== undefined) {
          await treatmentService.addJob(treatmentQueue, 'subscription', previousSubscription.id)
        }

        logger.info(
          {
            user,
            subscription,
            previousSubscription,
            backLog
          },
          `Subscription activated`
        )
      } finally {
        await treatmentService.closeQueue(treatmentQueue)
        await redisService.closePubSub(pubSub)
        await databaseService.closeDatabase(db)
      }
    }
  })
}

export default initCommand
