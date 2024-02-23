import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { redisService, systemService } from '@avito-speculant/redis'
import { queueService, heartbeatService } from '@avito-speculant/queue'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'system-stop',
    description: 'Stop running state',
    args: {},
    handler: async () => {
      const redisOptions = redisService.getRedisOptions<Config>(config)
      const redis = redisService.initRedis(redisOptions, logger)

      const queueConnection = queueService.getQueueConnection<Config>(config)
      const heartbeatQueue = heartbeatService.initQueue(queueConnection, logger)

      const jobs = await heartbeatQueue.getRepeatableJobs()

      for (const job of jobs) {
        logger.info(job, `Repeatable job now destroed`)

        heartbeatQueue.removeRepeatableByKey(job.key)
      }

      await heartbeatService.closeQueue(heartbeatQueue, logger)
      await redisService.closeRedis(redis, logger)
    }
  })
}
