import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { SCRAPER_QUEUE_NAME, queueService } from '@avito-speculant/queue'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'queue-listen-scraper',
    description: 'Queue listen scraper',
    args: {},
    handler: async () => {
      const queueConnection = queueService.getQueueConnection<Config>(config)
      const queueEvents = queueService.initQueueEvents(
        queueConnection,
        SCRAPER_QUEUE_NAME,
        logger
      )

      queueService.listenMonitor(queueEvents, logger)

      await queueService.runQueueEvents(queueEvents)
    }
  })
}
