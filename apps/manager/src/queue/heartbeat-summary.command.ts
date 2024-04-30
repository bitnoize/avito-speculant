import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { queueService, heartbeatService } from '@avito-speculant/queue'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'queue-heartbeat-summary',
    description: 'HeartbeatQueue summary',
    args: {},
    handler: async () => {
      const queueConnection = queueService.getQueueConnection<Config>(config)
      const heartbeatQueue = heartbeatService.initQueue(queueConnection, logger)

      try {
        const queueSummary = await heartbeatService.getQueueSummary(heartbeatQueue)

        logger.info({ queueSummary }, `HeartbeatQueue summary`)
      } finally {
        await heartbeatService.closeQueue(heartbeatQueue)
      }
    }
  })
}
