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
  HEARTBEAT_QUEUE_NAME,
  HeartbeatConfig,
  HeartbeatData,
  HeartbeatResult,
  HeartbeatQueue,
  HeartbeatJob,
  HeartbeatWorker,
  HeartbeatProcessor
} from './heartbeat.js'

/**
 * Initialize Queue
 */
export function initQueue(
  connection: ConnectionOptions,
  logger: Logger
): HeartbeatQueue {
  const queue = new Queue<HeartbeatData, HeartbeatResult>(HEARTBEAT_QUEUE_NAME, {
    connection
  })

  queue.on('error', (error) => {
    logger.error(error, `There was an error in the HeartbeatQueue`)
  })

  logger.debug(`HeartbeatQueue successfully initialized`)

  return queue
}

/**
 * Add repeatable Job
 */
export async function addRepeatableJob(
  queue: HeartbeatQueue,
  every: number
): Promise<HeartbeatJob> {
  return await queue.add(
    `blablabla`,
    {
      step: 'users'
    },
    {
      repeat: {
        every
      }
    }
  )
}

/**
 * Close Queue
 */
export async function closeQueue(
  queue: HeartbeatQueue,
  logger: Logger
): Promise<void> {
  await queue.close()

  logger.debug(`HeartbeatQueue successfully closed`)
}

/**
 * Initialize QueueEvents
 */
export function initQueueEvents(
  connection: ConnectionOptions,
  logger: Logger
): QueueEvents {
  const queueEvents = new QueueEvents(HEARTBEAT_QUEUE_NAME, {
    connection,
    autorun: false
  })

  queueEvents.on('error', (error) => {
    logger.error(error, `There was an error in the HeartbeatQueue`)
  })

  logger.debug(`HeartbeatQueueEvents successfully initialized`)

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

  logger.debug(`HeartbeatQueueEvents successfully started`)
}

/**
 * Close QueueEvents
 */
export async function closeQueueEvents(
  queueEvents: QueueEvents,
  logger: Logger
): Promise<void> {
  await queueEvents.close()

  logger.debug(`HeartbeatQueueEvents successfully closed`)
}

/**
 * Get Worker concurrency from config
 */
export function getWorkerConcurrency<T extends HeartbeatConfig>(config: T): number {
  return config.HEARTBEAT_CONCURRENCY
}

/**
 * Get Worker limiter from config
 */
export function getWorkerLimiter<T extends HeartbeatConfig>(
  config: T
): RateLimiterOptions {
  return {
    max: config.HEARTBEAT_LIMITER_MAX,
    duration: config.HEARTBEAT_LIMITER_DURATION
  }
}

/**
 * Initialize Worker
 */
export function initWorker(
  processor: HeartbeatProcessor,
  connection: ConnectionOptions,
  concurrency: number,
  limiter: RateLimiterOptions,
  logger: Logger
): HeartbeatWorker {
  const worker = new Worker<HeartbeatData, HeartbeatResult>(
    HEARTBEAT_QUEUE_NAME,
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
    logger.error(error, `There was an error in the HeartbeatWorker`)
  })

  logger.debug(`HeartbeatWorker successfully initialized`)

  return worker
}

/**
 * Start Worker
 */
export async function startWorker(
  worker: HeartbeatWorker,
  logger: Logger
): Promise<void> {
  await worker.run()

  logger.debug(`HeartbeatWorker successfully started`)
}

/**
 * Close Worker
 */
export async function closeWorker(
  worker: HeartbeatWorker,
  logger: Logger
): Promise<void> {
  await worker.close()

  logger.debug(`HeartbeatWorker successfully closed`)
}
