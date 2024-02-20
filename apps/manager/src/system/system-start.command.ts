import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { redisService } from '@avito-speculant/redis'
import { queueService, schedulerService } from '@avito-speculant/queue'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'system-start',
    description: 'Jump up to running state',
    args: {},
    handler: async () => {
      const redisOptions = redisService.getRedisOptions<Config>(config)
      const redis = redisService.initRedis(redisOptions, logger)

      const queueConnection = queueService.getQueueConnection<Config>(config)
      const scheduler = schedulerService.initQueue(queueConnection, logger)

      const job = await schedulerService.addRepeatableJob(scheduler, 10_000)

      logger.info(`Scheduler repeatable job added`)

      await schedulerService.closeQueue(scheduler, logger)
      await redisService.closeRedis(redis, logger)
    }
  })
}
