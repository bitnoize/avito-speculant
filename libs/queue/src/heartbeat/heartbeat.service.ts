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

  return queue
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

  return queueEvents
}

/**
 * Add Job
 */
export async function addJob(
  queue: HeartbeatQueue,
  every: number,
  logger: Logger
): Promise<HeartbeatJob> {
  const job = await queue.add(
    `queue_business`,
    {
      step: 'queue-users'
    },
    {
      repeat: {
        every
      }
    }
  )

  // FIXME
  logger.debug(`HeartbeatJob added`)

  return job
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

  return worker
}
