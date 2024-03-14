import { Logger } from '@avito-speculant/logger'
import { ConnectionOptions, RateLimiterOptions, Queue, Worker, MetricsTime } from 'bullmq'
import {
  HEARTBEAT_QUEUE_NAME,
  DEFAULT_HEARTBEAT_CONCURRENCY,
  DEFAULT_HEARTBEAT_LIMITER_MAX,
  DEFAULT_HEARTBEAT_LIMITER_DURATION,
  HeartbeatConfig,
  HeartbeatData,
  HeartbeatQueue,
  HeartbeatJob,
  HeartbeatWorker,
  HeartbeatProcessor
} from './heartbeat.js'

/**
 * Initialize Queue
 */
export function initQueue(connection: ConnectionOptions, logger: Logger): HeartbeatQueue {
  const queue = new Queue<HeartbeatData>(HEARTBEAT_QUEUE_NAME, {
    connection
  })

  queue.on('error', (error) => {
    logger.error(error, `There was an error in the HeartbeatQueue`)
  })

  return queue
}

/**
 * Add Job
 */
export async function addJob(
  queue: HeartbeatQueue,
  name: string,
  every: number
): Promise<HeartbeatJob> {
  return await queue.add(
    name,
    {
      step: 'produce-users'
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
export async function closeQueue(queue: HeartbeatQueue): Promise<void> {
  await queue.close()
}

/**
 * Get Worker concurrency from config
 */
export function getWorkerConcurrency<T extends HeartbeatConfig>(config: T): number {
  return config.HEARTBEAT_CONCURRENCY ?? DEFAULT_HEARTBEAT_CONCURRENCY
}

/**
 * Get Worker limiter from config
 */
export function getWorkerLimiter<T extends HeartbeatConfig>(config: T): RateLimiterOptions {
  return {
    max: config.HEARTBEAT_LIMITER_MAX ?? DEFAULT_HEARTBEAT_LIMITER_MAX,
    duration: config.HEARTBEAT_LIMITER_DURATION ?? DEFAULT_HEARTBEAT_LIMITER_DURATION
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
  const worker = new Worker<HeartbeatData>(HEARTBEAT_QUEUE_NAME, processor, {
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
  })

  worker.on('error', (error) => {
    logger.error(error, `There was an error in the HeartbeatWorker`)
  })

  return worker
}

/**
 * Run Worker
 */
export async function runWorker(worker: HeartbeatWorker): Promise<void> {
  await worker.run()
}

/**
 * Close Worker
 */
export async function closeWorker(worker: HeartbeatWorker): Promise<void> {
  await worker.close()
}
