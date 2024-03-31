import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { queueService, treatmentService } from '@avito-speculant/queue'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'queue-status-treatment',
    description: 'Queue status treatment',
    args: {},
    handler: async () => {
      const queueConnection = queueService.getQueueConnection<Config>(config)
      const treatmentQueue = treatmentService.initQueue(queueConnection, logger)

      const jobs = await treatmentQueue.getJobs()
      const workers = await treatmentQueue.getWorkers()

      logger.info({ jobs, workers }, `TreatmentQueue status`)

      await treatmentService.closeQueue(treatmentQueue)
    }
  })
}
