import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { queueService, heartbeatService } from '@avito-speculant/queue'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'queue-status-heartbeat',
    description: 'Queue status heartbeat',
    args: {},
    handler: async () => {
      const queueConnection = queueService.getQueueConnection<Config>(config)
      const heartbeatQueue = heartbeatService.initQueue(queueConnection, logger)

      const jobs = await heartbeatQueue.getRepeatableJobs()
      const workers = await heartbeatQueue.getWorkers()

      logger.info({ jobs, workers }, `HeartbeatQueue status`)

      await heartbeatService.closeQueue(heartbeatQueue)
    }
  })
}
