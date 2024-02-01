import {
  ConnectionOptions,
  QueueBaseOptions,
  FlowProducer,
  Job
} from 'bullmq'
import { Config } from '../config.js'
import { Logger } from '../logger.js'

/**
 * Get QueueConnection from config
 */
export function getQueueConnection(config: Config): ConnectionOptions {
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
 * Initialize FlowProducer instance
 */
export async function initFlowProducer(
  connection: ConnectionOptions,
  logger: Logger
): Promise<FlowProducer> {
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
