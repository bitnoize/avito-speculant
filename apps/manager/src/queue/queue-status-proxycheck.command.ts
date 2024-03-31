import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { queueService, proxycheckService } from '@avito-speculant/queue'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'queue-status-proxycheck',
    description: 'Queue status proxycheck',
    args: {},
    handler: async () => {
      const queueConnection = queueService.getQueueConnection<Config>(config)
      const proxycheckQueue = proxycheckService.initQueue(queueConnection, logger)

      const jobs = await proxycheckQueue.getJobs()
      const workers = await proxycheckQueue.getWorkers()

      logger.info({ jobs, workers }, `TreatmentQueue status`)

      await proxycheckService.closeQueue(proxycheckQueue)
    }
  })
}
