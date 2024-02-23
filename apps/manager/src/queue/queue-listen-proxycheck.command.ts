import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { queueService, proxycheckService } from '@avito-speculant/queue'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'queue-listen-proxycheck',
    description: 'Queue listen proxycheck',
    args: {},
    handler: async () => {
      const queueConnection = queueService.getQueueConnection<Config>(config)
      const proxycheckQueueEvents = proxycheckService.initQueueEvents(queueConnection, logger)

      proxycheckQueueEvents.on('added', (args, id) => {
        logger.info({ args, id }, `ProxycheckJob added`)
      })

      proxycheckQueueEvents.on('duplicated', (args, id) => {
        logger.debug({ args, id }, `ProxycheckJob duplicated`)
      })

      proxycheckQueueEvents.on('delayed', (args, id) => {
        logger.debug({ args, id }, `ProxycheckJob delayed`)
      })

      proxycheckQueueEvents.on('waiting', (args, id) => {
        logger.debug({ args, id }, `ProxycheckJob waiting`)
      })

      proxycheckQueueEvents.on('active', (args, id) => {
        logger.debug({ args, id }, `ProxycheckJob active`)
      })

      proxycheckQueueEvents.on('completed', (args, id) => {
        logger.info({ args, id }, `ProxycheckJob completed`)
      })

      proxycheckQueueEvents.on('progress', (args, id) => {
        logger.debug({ args, id }, `ProxycheckJob progress`)
      })

      proxycheckQueueEvents.on('failed', (args, id) => {
        logger.debug({ args, id }, `ProxycheckJob failed`)
      })

      proxycheckQueueEvents.on('stalled', (args, id) => {
        logger.warn({ args, id }, `ProxycheckJob stalled`)
      })

      proxycheckQueueEvents.on('removed', (args, id) => {
        logger.warn({ args, id }, `ProxycheckJob removed`)
      })

      proxycheckQueueEvents.on('cleaned', (args, id) => {
        logger.warn({ args, id }, `ProxycheckJob cleaned`)
      })

      proxycheckQueueEvents.on('drained', (id) => {
        logger.warn({ id }, `ProxycheckJob drained`)
      })

      await proxycheckService.startQueueEvents(proxycheckQueueEvents, logger)
    }
  })
}
