import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { queueService, businessService } from '@avito-speculant/queue'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'queue-listen-business',
    description: 'Queue listen business',
    args: {},
    handler: async () => {
      const queueConnection = queueService.getQueueConnection<Config>(config)
      const businessQueueEvents = businessService.initQueueEvents(queueConnection, logger)

      businessQueueEvents.on('added', (args, id) => {
        logger.info({ args, id }, `BusinessJob added`)
      })

      businessQueueEvents.on('duplicated', (args, id) => {
        logger.debug({ args, id }, `BusinessJob duplicated`)
      })

      businessQueueEvents.on('delayed', (args, id) => {
        logger.debug({ args, id }, `BusinessJob delayed`)
      })

      businessQueueEvents.on('waiting', (args, id) => {
        logger.debug({ args, id }, `BusinessJob waiting`)
      })

      businessQueueEvents.on('active', (args, id) => {
        logger.debug({ args, id }, `BusinessJob active`)
      })

      businessQueueEvents.on('completed', (args, id) => {
        logger.info({ args, id }, `BusinessJob completed`)
      })

      businessQueueEvents.on('progress', (args, id) => {
        logger.debug({ args, id }, `BusinessJob progress`)
      })

      businessQueueEvents.on('failed', (args, id) => {
        logger.debug({ args, id }, `BusinessJob failed`)
      })

      businessQueueEvents.on('stalled', (args, id) => {
        logger.warn({ args, id }, `BusinessJob stalled`)
      })

      businessQueueEvents.on('removed', (args, id) => {
        logger.warn({ args, id }, `BusinessJob removed`)
      })

      businessQueueEvents.on('cleaned', (args, id) => {
        logger.warn({ args, id }, `BusinessJob cleaned`)
      })

      businessQueueEvents.on('drained', (id) => {
        logger.warn({ id }, `BusinessJob drained`)
      })

      await businessService.startQueueEvents(businessQueueEvents, logger)
    }
  })
}
