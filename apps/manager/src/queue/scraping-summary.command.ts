import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { queueService, scrapingService } from '@avito-speculant/queue'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'queue-scraping-summary',
    description: 'ScrapingQueue summary',
    args: {},
    handler: async () => {
      const queueConnection = queueService.getQueueConnection<Config>(config)
      const scrapingQueue = scrapingService.initQueue(queueConnection, logger)

      try {
        const queueSummary = await scrapingService.getQueueSummary(scrapingQueue)

        const repeatableJobs = await scrapingQueue.getRepeatableJobs()
        const delayedJobs = await scrapingQueue.getDelayed()

        logger.info({ queueSummary, repeatableJobs, delayedJobs }, `ScrapingQueue summary`)
      } finally {
        await scrapingService.closeQueue(scrapingQueue)
      }
    }
  })
}
