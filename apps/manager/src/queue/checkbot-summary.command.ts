import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { queueService, checkbotService } from '@avito-speculant/queue'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'queue-checkbot-summary',
    description: 'CheckbotQueue summary',
    args: {},
    handler: async () => {
      const queueConnection = queueService.getQueueConnection<Config>(config)
      const checkbotQueue = checkbotService.initQueue(queueConnection, logger)

      try {
        const queueSummary = await checkbotService.getQueueSummary(checkbotQueue)

        logger.info({ queueSummary }, `CheckbotQueue summary`)
      } finally {
        await checkbotService.closeQueue(checkbotQueue)
      }
    }
  })
}
