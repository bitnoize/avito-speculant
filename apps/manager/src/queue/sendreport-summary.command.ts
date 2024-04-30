import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { queueService, sendreportService } from '@avito-speculant/queue'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'queue-sendreport-summary',
    description: 'SendreportQueue summary',
    args: {},
    handler: async () => {
      const queueConnection = queueService.getQueueConnection<Config>(config)
      const sendreportQueue = sendreportService.initQueue(queueConnection, logger)

      try {
        const queueSummary = await sendreportService.getQueueSummary(sendreportQueue)

        logger.info({ queueSummary }, `SendreportQueue summary`)
      } finally {
        await sendreportService.closeQueue(sendreportQueue)
      }
    }
  })
}
