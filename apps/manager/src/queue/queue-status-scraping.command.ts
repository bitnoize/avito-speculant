import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { queueService, scrapingService } from '@avito-speculant/queue'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'queue-status-scraping',
    description: 'Queue status scraping',
    args: {},
    handler: async () => {
      const queueConnection = queueService.getQueueConnection<Config>(config)
      const scrapingQueue = scrapingService.initQueue(queueConnection, logger)

      const jobs = await scrapingQueue.getRepeatableJobs()
      const workers = await scrapingQueue.getWorkers()

      logger.info({ jobs, workers }, `ScrapingQueue status`)

      await scrapingService.closeQueue(scrapingQueue)
    }
  })
}
