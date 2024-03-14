import { command, option, string } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { databaseService, proxyService } from '@avito-speculant/database'
import { redisService } from '@avito-speculant/redis'
import { queueService, treatmentService } from '@avito-speculant/queue'
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
      const treatmentQueue = treatmentService.initQueue(queueConnection, logger)

      const { proxy, backLog } = await proxyService.createProxy(db, {
        proxyUrl,
        data: {
          message: `Proxy created via Manager`
        }
      })

      await redisService.publishBackLog(pubSub, backLog)

      await treatmentService.addJob(treatmentQueue, 'proxy', proxy.id)

      logger.info({ proxy, backLog }, `Proxy successfully created`)

      await treatmentService.closeQueue(treatmentQueue)
      await redisService.closePubSub(pubSub)
      await databaseService.closeDatabase(db)
    }
  })
}
