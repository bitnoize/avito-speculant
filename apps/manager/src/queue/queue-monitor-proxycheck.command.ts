import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { PROXYCHECK_QUEUE_NAME, queueService } from '@avito-speculant/queue'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'queue-monitor-proxycheck',
    description: 'Queue monitor proxycheck',
    args: {},
    handler: async () => {
      const queueConnection = queueService.getQueueConnection<Config>(config)
      const queueEvents = queueService.initQueueEvents(
        queueConnection,
        PROXYCHECK_QUEUE_NAME,
        logger
      )

      queueService.listenMonitor(queueEvents, logger)

      await queueService.runQueueEvents(queueEvents)
    }
  })
}
