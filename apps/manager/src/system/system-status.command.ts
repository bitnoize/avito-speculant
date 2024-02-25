import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { redisService, systemService } from '@avito-speculant/redis'
import { queueService, heartbeatService } from '@avito-speculant/queue'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'system-status',
    description: 'Display current status',
    args: {},
    handler: async () => {
      const redisOptions = redisService.getRedisOptions<Config>(config)
      const redis = redisService.initRedis(redisOptions, logger)

      //await systemService.acquireHeartbeatLock(redis, logger, 'test', 60_000)

      const queueConnection = queueService.getQueueConnection<Config>(config)
      const heartbeatQueue = heartbeatService.initQueue(queueConnection, logger)

      const jobs = await heartbeatQueue.getRepeatableJobs()

      for (const job of jobs) {
        logger.info(job, `Repeatable job dumped`)
      }

      await heartbeatQueue.close()
      await redis.disconnect()
    }
  })
}
