import { ConnectionOptions, QueueBaseOptions, FlowProducer, QueueEvents } from 'bullmq'
import { Logger } from '@avito-speculant/logger'
import { QueueConfig } from './queue.js'

/**
 * Get QueueConnection from config
 */
export function getQueueConnection<T extends QueueConfig>(config: T): ConnectionOptions {
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
export function initFlowProducer(connection: ConnectionOptions, logger: Logger): FlowProducer {
  const queueOptions: QueueBaseOptions = {
    connection
  }

  const flowProducer = new FlowProducer(queueOptions)

  flowProducer.on('error', (error) => {
    logger.error(error, `There was an error in the FlowProducer`)
  })

  return flowProducer
}

/**
 * Close FlowProducer
 */
export async function closeFlowProducer(flowProducer: FlowProducer): Promise<void> {
  await flowProducer.close()
}

/**
 * Initialize QueueEvents
 */
export function initQueueEvents(
  connection: ConnectionOptions,
  name: string,
  logger: Logger
): QueueEvents {
  const queueEvents = new QueueEvents(name, {
    connection,
    autorun: false
  })

  queueEvents.on('error', (error) => {
    logger.error(error, `There was an error in the QueueEvents`)
  })

  return queueEvents
}

/**
 * Listen QueueEvents
 */
export function listenMonitor(queueEvents: QueueEvents, logger: Logger): void {
  queueEvents.on('added', (args, id) => {
    logger.info({ args, id }, `Job added`)
  })

  queueEvents.on('duplicated', (args, id) => {
    logger.debug({ args, id }, `Job duplicated`)
  })

  queueEvents.on('delayed', (args, id) => {
    logger.debug({ args, id }, `Job delayed`)
  })

  queueEvents.on('waiting', (args, id) => {
    logger.debug({ args, id }, `Job waiting`)
  })

  queueEvents.on('active', (args, id) => {
    logger.debug({ args, id }, `Job active`)
  })

  queueEvents.on('completed', (args, id) => {
    logger.info({ args, id }, `Job completed`)
  })

  queueEvents.on('progress', (args, id) => {
    logger.debug({ args, id }, `Job progress`)
  })

  queueEvents.on('failed', (args, id) => {
    logger.debug({ args, id }, `Job failed`)
  })

  queueEvents.on('stalled', (args, id) => {
    logger.warn({ args, id }, `Job stalled`)
  })

  queueEvents.on('removed', (args, id) => {
    logger.warn({ args, id }, `Job removed`)
  })

  queueEvents.on('cleaned', (args, id) => {
    logger.warn({ args, id }, `Job cleaned`)
  })

  queueEvents.on('drained', (id) => {
    logger.warn({ id }, `Job drained`)
  })
}

/**
 * Run QueueEvents
 */
export async function runQueueEvents(queueEvents: QueueEvents): Promise<void> {
  await queueEvents.run()
}

/**
 * Close QueueEvents
 */
export async function closeQueueEvents(queueEvents: QueueEvents): Promise<void> {
  await queueEvents.close()
}
