import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { queueService, throttleService } from '@avito-speculant/queue'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'queue-status-throttle',
    description: 'Queue status throttle',
    args: {},
    handler: async () => {
      const queueConnection = queueService.getQueueConnection<Config>(config)
      const throttleQueue = throttleService.initQueue(queueConnection, logger)

      const jobs = await throttleQueue.getRepeatableJobs()
      const workers = await throttleQueue.getWorkers()

      logger.info({ jobs, workers }, `ThrottleQueue status`)

      await throttleService.closeQueue(throttleQueue)
    }
  })
}
