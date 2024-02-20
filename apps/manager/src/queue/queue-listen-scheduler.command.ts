import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { queueService, schedulerService } from '@avito-speculant/queue'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'queue-listen-scheduler',
    description: 'Queue listen scheduler',
    args: {},
    handler: async () => {
      const queueConnection = queueService.getQueueConnection<Config>(config)
      const schedulerEvents = schedulerService.initQueueEvents(queueConnection, logger)

      schedulerEvents.on('added', (args, id) => {
        logger.info({ args, id }, `Scheduler job added`)
      })

      schedulerEvents.on('duplicated', (args, id) => {
        logger.debug({ args, id }, `Scheduler job duplicated`)
      })

      schedulerEvents.on('delayed', (args, id) => {
        logger.debug({ args, id }, `Scheduler job delayed`)
      })

      schedulerEvents.on('waiting', (args, id) => {
        logger.debug({ args, id }, `Scheduler job waiting`)
      })

      schedulerEvents.on('active', (args, id) => {
        logger.debug({ args, id }, `Scheduler job active`)
      })

      schedulerEvents.on('completed', (args, id) => {
        logger.info({ args, id }, `Scheduler job completed`)
      })

      schedulerEvents.on('progress', (args, id) => {
        logger.debug({ args, id }, `Scheduler job progress`)
      })

      schedulerEvents.on('failed', (args, id) => {
        logger.debug({ args, id }, `Scheduler job failed`)
      })

      schedulerEvents.on('stalled', (args, id) => {
        logger.warn({ args, id }, `Scheduler job stalled`)
      })

      schedulerEvents.on('removed', (args, id) => {
        logger.warn({ args, id }, `Scheduler job removed`)
      })

      schedulerEvents.on('cleaned', (args, id) => {
        logger.warn({ args, id }, `Scheduler job cleaned`)
      })

      schedulerEvents.on('drained', (id) => {
        logger.warn({ id }, `Scheduler job drained`)
      })

      await schedulerService.startQueueEvents(schedulerEvents, logger)
    }
  })
}
