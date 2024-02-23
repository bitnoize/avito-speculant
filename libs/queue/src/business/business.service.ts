import { Logger } from '@avito-speculant/logger'
import {
  ConnectionOptions,
  RateLimiterOptions,
  Queue,
  QueueEvents,
  Worker,
  MetricsTime
} from 'bullmq'
import {
  BUSINESS_QUEUE_NAME,
  BusinessConfig,
  BusinessData,
  BusinessResult,
  BusinessQueue,
  BusinessJob,
  BusinessWorker,
  BusinessProcessor
} from './business.js'

/**
 * Initialize Queue
 */
export function initQueue(
  connection: ConnectionOptions,
  logger: Logger
): BusinessQueue {
  const queue = new Queue<BusinessData, BusinessResult>(BUSINESS_QUEUE_NAME, {
    connection
  })

  queue.on('error', (error) => {
    logger.error(error, `There was an error in the BusinessQueue`)
  })

  logger.debug(`BusinessQueue successfully initialized`)

  return queue
}

/**
 * Close Queue
 */
export async function closeQueue(
  queue: BusinessQueue,
  logger: Logger
): Promise<void> {
  await queue.close()

  logger.debug(`BusinessQueue successfully closed`)
}

/**
 * Initialize QueueEvents
 */
export function initQueueEvents(
  connection: ConnectionOptions,
  logger: Logger
): QueueEvents {
  const queueEvents = new QueueEvents(BUSINESS_QUEUE_NAME, {
    connection,
    autorun: false
  })

  queueEvents.on('error', (error) => {
    logger.error(error, `There was an error in the BusinessQueue`)
  })

  logger.debug(`BusinessQueueEvents successfully initialized`)

  return queueEvents
}

/**
 * Start QueueEvents
 */
export async function startQueueEvents(
  queueEvents: QueueEvents,
  logger: Logger
): Promise<void> {
  await queueEvents.run()

  logger.debug(`BusinessQueueEvents successfully started`)
}

/**
 * Close QueueEvents
 */
export async function closeQueueEvents(
  queueEvents: QueueEvents,
  logger: Logger
): Promise<void> {
  await queueEvents.close()

  logger.debug(`BusinessQueueEvents successfully closed`)
}

/**
 * Get Worker concurrency from config
 */
export function getWorkerConcurrency<T extends BusinessConfig>(config: T): number {
  return config.BUSINESS_CONCURRENCY
}

/**
 * Get Worker limiter from config
 */
export function getWorkerLimiter<T extends BusinessConfig>(
  config: T
): RateLimiterOptions {
  return {
    max: config.BUSINESS_LIMITER_MAX,
    duration: config.BUSINESS_LIMITER_DURATION
  }
}

/**
 * Initialize Worker
 */
export function initWorker(
  processor: BusinessProcessor,
  connection: ConnectionOptions,
  concurrency: number,
  limiter: RateLimiterOptions,
  logger: Logger
): BusinessWorker {
  const worker = new Worker<BusinessData, BusinessResult>(
    BUSINESS_QUEUE_NAME,
    processor,
    {
      connection,
      concurrency,
      limiter,
      autorun: false,
      removeOnComplete: {
        count: 0
      },
      removeOnFail: {
        count: 0
      },
      metrics: {
        maxDataPoints: MetricsTime.ONE_WEEK
      }
    }
  )

  worker.on('error', (error) => {
    logger.error(error, `There was an error in the BusinessWorker`)
  })

  logger.debug(`BusinessWorker successfully initialized`)

  return worker
}

/**
 * Start Worker
 */
export async function startWorker(
  worker: BusinessWorker,
  logger: Logger
): Promise<void> {
  await worker.run()

  logger.debug(`BusinessWorker successfully started`)
}

/**
 * Close Worker
 */
export async function closeWorker(
  worker: BusinessWorker,
  logger: Logger
): Promise<void> {
  await worker.close()

  logger.debug(`BusinessWorker successfully closed`)
}
