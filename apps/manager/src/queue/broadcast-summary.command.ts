import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { queueService, broadcastService } from '@avito-speculant/queue'
import { Config, InitCommand } from '../manager.js'

const initCommand: InitCommand = (config, logger) => {
  return command({
    name: 'queue-broadcast-summary',
    description: `BroadcastQueue summary`,
    args: {},
    handler: async () => {
      const queueConnection = queueService.getQueueConnection<Config>(config)
      const broadcastQueue = broadcastService.initQueue(queueConnection, logger)

      try {
        const queueSummary = await broadcastService.getQueueSummary(broadcastQueue)

        logger.info({ queueSummary }, `BroadcastQueue summary`)
      } finally {
        await broadcastService.closeQueue(broadcastQueue)
      }
    }
  })
}

export default initCommand
