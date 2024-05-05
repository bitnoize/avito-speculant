import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { queueService, checkproxyService } from '@avito-speculant/queue'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'queue-checkproxy-summary',
    description: 'CheckproxyQueue summary',
    args: {},
    handler: async () => {
      const queueConnection = queueService.getQueueConnection<Config>(config)
      const checkproxyQueue = checkproxyService.initQueue(queueConnection, logger)

      try {
        const queueSummary = await checkproxyService.getQueueSummary(checkproxyQueue)

        logger.info({ queueSummary }, `CheckproxyQueue summary`)
      } finally {
        await checkproxyService.closeQueue(checkproxyQueue)
      }
    }
  })
}
