import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { redisService } from '@avito-speculant/redis'
import { queueService, heartbeatService } from '@avito-speculant/queue'
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

      try {
        await heartbeatService.removeRepeatableJob(heartbeatQueue)
      } finally {
        await heartbeatService.closeQueue(heartbeatQueue)
        await redisService.closeRedis(redis)
      }
    }
  })
}

export default initCommand
