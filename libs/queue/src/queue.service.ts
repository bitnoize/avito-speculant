import { ConnectionOptions, QueueBaseOptions, FlowProducer } from 'bullmq'
import { Logger } from '@avito-speculant/logger'
import { QueueConfig } from './queue.js'

/**
 * Get QueueConnection from config
 */
export function getQueueConnection<T extends QueueConfig>(
  config: T
): ConnectionOptions {
  const connection: ConnectionOptions = {
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
    db: config.REDIS_DATABASE,
    username: config.REDIS_USERNAME,
    password: config.REDIS_PASSWORD
  }

  return connection
}

/**
 * Initialize FlowProducer
 */
export function initFlowProducer(
  connection: ConnectionOptions,
  logger: Logger
): FlowProducer {
  const queueOptions: QueueBaseOptions = {
    connection
  }

  const flowProducer = new FlowProducer(queueOptions)

  flowProducer.on('error', (error) => {
    logger.error(error, `There was an error in the FlowProducer`)
  })

  logger.debug(`FlowProducer successfully initialized`)

  return flowProducer
}

/**
 * Close FlowProducer
 */
export async function closeFlowProducer(
  flowProducer: FlowProducer,
  logger: Logger
): Promise<void> {
  await flowProducer.close()

  logger.debug(`FlowProducer successfully closed`)
}
