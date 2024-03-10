import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { BUSINESS_QUEUE_NAME, queueService } from '@avito-speculant/queue'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'queue-monitor-business',
    description: 'Queue monitor business',
    args: {},
    handler: async () => {
      const queueConnection = queueService.getQueueConnection<Config>(config)
      const queueEvents = queueService.initQueueEvents(queueConnection, BUSINESS_QUEUE_NAME, logger)

      queueService.listenMonitor(queueEvents, logger)

      await queueService.runQueueEvents(queueEvents)
    }
  })
}
