import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { redisService, systemService } from '@avito-speculant/redis'
import { queueService, heartbeatService, throttleService } from '@avito-speculant/queue'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'system-start',
    description: 'Start system',
    args: {},
    handler: async () => {
      const redisOptions = redisService.getRedisOptions<Config>(config)
      const redis = redisService.initRedis(redisOptions, logger)

      const queueConnection = queueService.getQueueConnection<Config>(config)
      const heartbeatQueue = heartbeatService.initQueue(queueConnection, logger)
      const throttleQueue = throttleService.initQueue(queueConnection, logger)

      await heartbeatService.addRepeatableJob(heartbeatQueue)
      await throttleService.addRepeatableJob(throttleQueue)

      await heartbeatService.closeQueue(heartbeatQueue)
      await throttleService.closeQueue(throttleQueue)
      await redisService.closeRedis(redis)
    }
  })
}
