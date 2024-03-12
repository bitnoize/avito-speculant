import { command, positional, number } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { databaseService, proxyService } from '@avito-speculant/database'
import { redisService } from '@avito-speculant/redis'
import { queueService, businessService } from '@avito-speculant/queue'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'database-disable-proxy',
    description: 'Database disable proxy',
    args: {
      proxyId: positional({
        type: number,
        displayName: 'proxyId'
      })
    },
    handler: async ({ proxyId }) => {
      const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
      const db = databaseService.initDatabase(databaseConfig, logger)

      const redisOptions = redisService.getRedisOptions<Config>(config)
      const pubSub = redisService.initPubSub(redisOptions, logger)

      const queueConnection = queueService.getQueueConnection<Config>(config)
      const businessQueue = businessService.initQueue(queueConnection, logger)

      const { proxy, backLog } = await proxyService.disableProxy(db, {
        proxyId,
        data: {
          message: `Proxy disabled via Manager`
        }
      })

      await redisService.publishBackLog(pubSub, backLog)

      await businessService.addJob(businessQueue, 'proxy', proxy.id)

      logger.info({ proxy, backLog }, `Proxy successfully disabled`)

      await businessService.closeQueue(businessQueue)
      await redisService.closePubSub(pubSub)
      await databaseService.closeDatabase(db)
    }
  })
}
