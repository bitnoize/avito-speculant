import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { redisService } from '@avito-speculant/redis'
import { queueService, schedulerService } from '@avito-speculant/queue'
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
      const scheduler = schedulerService.initQueue(queueConnection, logger)

      const jobs = await scheduler.getRepeatableJobs()

      for (const job of jobs) {
        logger.info(job, `Repeatable job now destroed`)

        scheduler.removeRepeatableByKey(job.key)
      }

      await schedulerService.closeQueue(scheduler, logger)
      await redisService.closeRedis(redis, logger)
    }
  })
}
