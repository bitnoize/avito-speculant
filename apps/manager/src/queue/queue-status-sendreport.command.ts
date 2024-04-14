import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { queueService, sendreportService } from '@avito-speculant/queue'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'queue-status-sendreport',
    description: 'Queue status sendreport',
    args: {},
    handler: async () => {
      const queueConnection = queueService.getQueueConnection<Config>(config)
      const sendreportQueue = sendreportService.initQueue(queueConnection, logger)

      const jobs = await sendreportQueue.getRepeatableJobs()
      const workers = await sendreportQueue.getWorkers()

      logger.info({ jobs, workers }, `SendreportQueue status`)

      await sendreportService.closeQueue(sendreportQueue)
    }
  })
}
