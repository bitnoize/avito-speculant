import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { queueService, heartbeatService } from '@avito-speculant/queue'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'queue-listen-heartbeat',
    description: 'Queue listen heartbeat',
    args: {},
    handler: async () => {
      const queueConnection = queueService.getQueueConnection<Config>(config)
      const heartbeatQueueEvents = heartbeatService.initQueueEvents(queueConnection, logger)

      heartbeatQueueEvents.on('added', (args, id) => {
        logger.info({ args, id }, `HeartbeatJob added`)
      })

      heartbeatQueueEvents.on('duplicated', (args, id) => {
        logger.debug({ args, id }, `HeartbeatJob duplicated`)
      })

      heartbeatQueueEvents.on('delayed', (args, id) => {
        logger.debug({ args, id }, `HeartbeatJob delayed`)
      })

      heartbeatQueueEvents.on('waiting', (args, id) => {
        logger.debug({ args, id }, `HeartbeatJob waiting`)
      })

      heartbeatQueueEvents.on('active', (args, id) => {
        logger.debug({ args, id }, `HeartbeatJob active`)
      })

      heartbeatQueueEvents.on('completed', (args, id) => {
        logger.info({ args, id }, `HeartbeatJob completed`)
      })

      heartbeatQueueEvents.on('progress', (args, id) => {
        logger.debug({ args, id }, `HeartbeatJob progress`)
      })

      heartbeatQueueEvents.on('failed', (args, id) => {
        logger.debug({ args, id }, `HeartbeatJob failed`)
      })

      heartbeatQueueEvents.on('stalled', (args, id) => {
        logger.warn({ args, id }, `HeartbeatJob stalled`)
      })

      heartbeatQueueEvents.on('removed', (args, id) => {
        logger.warn({ args, id }, `HeartbeatJob removed`)
      })

      heartbeatQueueEvents.on('cleaned', (args, id) => {
        logger.warn({ args, id }, `HeartbeatJob cleaned`)
      })

      heartbeatQueueEvents.on('drained', (id) => {
        logger.warn({ id }, `HeartbeatJob drained`)
      })

      await heartbeatService.startQueueEvents(heartbeatQueueEvents, logger)
    }
  })
}
