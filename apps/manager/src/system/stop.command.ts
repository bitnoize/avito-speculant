import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { redisService, systemService } from '@avito-speculant/redis'
import { queueService, heartbeatService, throttleService } from '@avito-speculant/queue'
import { Config, InitCommand } from '../manager.js'

const initCommand: InitCommand = (config, logger) => {
  return command({
    name: 'system-stop',
    description: 'stop system',
    args: {},
    handler: async () => {
      const redisOptions = redisService.getRedisOptions<Config>(config)
      const redis = redisService.initRedis(redisOptions, logger)

      const queueConnection = queueService.getQueueConnection<Config>(config)
      const heartbeatQueue = heartbeatService.initQueue(queueConnection, logger)
      const throttleQueue = throttleService.initQueue(queueConnection, logger)

      try {
        await heartbeatService.removeRepeatableJob(heartbeatQueue)
        await throttleService.removeRepeatableJob(throttleQueue)
      } finally {
        await heartbeatService.closeQueue(heartbeatQueue)
        await throttleService.closeQueue(throttleQueue)
        await redisService.closeRedis(redis)
      }
    }
  })
}

export default initCommand
