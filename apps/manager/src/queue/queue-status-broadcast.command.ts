import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { queueService, broadcastService } from '@avito-speculant/queue'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'queue-status-broadcast',
    description: 'Queue status broadcast',
    args: {},
    handler: async () => {
      const queueConnection = queueService.getQueueConnection<Config>(config)
      const broadcastQueue = broadcastService.initQueue(queueConnection, logger)

      const jobs = await broadcastQueue.getRepeatableJobs()
      const workers = await broadcastQueue.getWorkers()

      logger.info({ jobs, workers }, `BroadcastQueue status`)

      await broadcastService.closeQueue(broadcastQueue)
    }
  })
}
