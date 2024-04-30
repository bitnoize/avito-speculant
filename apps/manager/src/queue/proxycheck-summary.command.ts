import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { queueService, proxycheckService } from '@avito-speculant/queue'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'queue-proxycheck-summary',
    description: 'ProxycheckQueue summary',
    args: {},
    handler: async () => {
      const queueConnection = queueService.getQueueConnection<Config>(config)
      const proxycheckQueue = proxycheckService.initQueue(queueConnection, logger)

      try {
        const queueSummary = await proxycheckService.getQueueSummary(proxycheckQueue)

        logger.info({ queueSummary }, `ProxycheckQueue summary`)
      } finally {
        await proxycheckService.closeQueue(proxycheckQueue)
      }
    }
  })
}
