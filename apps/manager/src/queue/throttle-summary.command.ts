import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { queueService, throttleService } from '@avito-speculant/queue'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'queue-throttle-summary',
    description: 'ThrottleQueue summary',
    args: {},
    handler: async () => {
      const queueConnection = queueService.getQueueConnection<Config>(config)
      const throttleQueue = throttleService.initQueue(queueConnection, logger)

      try {
        const queueSummary = await throttleService.getQueueSummary(throttleQueue)

        logger.info({ queueSummary }, `ThrottleQueue summary`)
      } finally {
        await throttleService.closeQueue(throttleQueue)
      }
    }
  })
}
