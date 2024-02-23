import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { queueService, scraperService } from '@avito-speculant/queue'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'queue-listen-scraper',
    description: 'Queue listen scraper',
    args: {},
    handler: async () => {
      const queueConnection = queueService.getQueueConnection<Config>(config)
      const scraperQueueEvents = scraperService.initQueueEvents(queueConnection, logger)

      scraperQueueEvents.on('added', (args, id) => {
        logger.info({ args, id }, `ScraperJob added`)
      })

      scraperQueueEvents.on('duplicated', (args, id) => {
        logger.debug({ args, id }, `ScraperJob duplicated`)
      })

      scraperQueueEvents.on('delayed', (args, id) => {
        logger.debug({ args, id }, `ScraperJob delayed`)
      })

      scraperQueueEvents.on('waiting', (args, id) => {
        logger.debug({ args, id }, `ScraperJob waiting`)
      })

      scraperQueueEvents.on('active', (args, id) => {
        logger.debug({ args, id }, `ScraperJob active`)
      })

      scraperQueueEvents.on('completed', (args, id) => {
        logger.info({ args, id }, `ScraperJob completed`)
      })

      scraperQueueEvents.on('progress', (args, id) => {
        logger.debug({ args, id }, `ScraperJob progress`)
      })

      scraperQueueEvents.on('failed', (args, id) => {
        logger.debug({ args, id }, `ScraperJob failed`)
      })

      scraperQueueEvents.on('stalled', (args, id) => {
        logger.warn({ args, id }, `ScraperJob stalled`)
      })

      scraperQueueEvents.on('removed', (args, id) => {
        logger.warn({ args, id }, `ScraperJob removed`)
      })

      scraperQueueEvents.on('cleaned', (args, id) => {
        logger.warn({ args, id }, `ScraperJob cleaned`)
      })

      scraperQueueEvents.on('drained', (id) => {
        logger.warn({ id }, `ScraperJob drained`)
      })

      await scraperService.startQueueEvents(scraperQueueEvents, logger)
    }
  })
}
