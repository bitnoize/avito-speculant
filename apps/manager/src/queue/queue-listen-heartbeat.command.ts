import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { HEARTBEAT_QUEUE_NAME, queueService } from '@avito-speculant/queue'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'queue-listen-heartbeat',
    description: 'Queue listen heartbeat',
    args: {},
    handler: async () => {
      const queueConnection = queueService.getQueueConnection<Config>(config)
      const queueEvents = queueService.initQueueEvents(
        HEARTBEAT_QUEUE_NAME,
        queueConnection,
        logger
      )

      await queueService.runQueueEvents(queueEvents)
    }
  })
}
