import { command, option, string } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { databaseService, proxyService } from '@avito-speculant/database'
import { redisService } from '@avito-speculant/redis'
import { queueService, businessService } from '@avito-speculant/queue'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'database-create-proxy',
    description: 'Database create proxy',
    args: {
      proxyUrl: option({
        type: string,
        long: 'proxy-url'
      })
    },
    handler: async ({ proxyUrl }) => {
      const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
      const db = databaseService.initDatabase(databaseConfig, logger)

      const redisOptions = redisService.getRedisOptions<Config>(config)
      const pubSub = redisService.initPubSub(redisOptions, logger)

      const queueConnection = queueService.getQueueConnection<Config>(config)
      const businessQueue = businessService.initQueue(queueConnection, logger)

      const createdProxy = await proxyService.createProxy(db, {
        proxyUrl,
        data: {
          message: `Proxy created via Manager`
        }
      })
      logger.info(createdProxy)

      const { proxy, backLog } = createdProxy

      await redisService.publishBackLog(pubSub, backLog)

      await businessService.addJob(businessQueue, 'proxy', proxy.id)

      await businessService.closeQueue(businessQueue)
      await redisService.closePubSub(pubSub)
      await databaseService.closeDatabase(db)
    }
  })
}
