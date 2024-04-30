import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { queueService, treatmentService } from '@avito-speculant/queue'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'queue-treatment-summary',
    description: 'TreatmentQueue summary',
    args: {},
    handler: async () => {
      const queueConnection = queueService.getQueueConnection<Config>(config)
      const treatmentQueue = treatmentService.initQueue(queueConnection, logger)

      try {
        const queueSummary = await treatmentService.getQueueSummary(treatmentQueue)

        logger.info({ queueSummary }, `TreatmentQueue summary`)
      } finally {
        await treatmentService.closeQueue(treatmentQueue)
      }
    }
  })
}
