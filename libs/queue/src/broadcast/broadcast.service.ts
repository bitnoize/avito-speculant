import { Logger } from '@avito-speculant/logger'
import { ConnectionOptions, RateLimiterOptions } from 'bullmq'
import {
  BROADCAST_QUEUE_NAME,
  BROADCAST_REPEAT_EVERY,
  BroadcastConfig,
  BroadcastName,
  BroadcastData,
  BroadcastResult,
  BroadcastQueue,
  BroadcastJob,
  BroadcastWorker,
  BroadcastProcessor
} from './broadcast.js'
import { initBaseQueue, initBaseWorker, runBaseWorker } from '../queue.service.js'

/**
 * Initialize Queue
 */
export function initQueue(connection: ConnectionOptions, logger: Logger): BroadcastQueue {
  return initBaseQueue<BroadcastData, BroadcastResult, BroadcastName>(
    BROADCAST_QUEUE_NAME,
    connection,
    logger
  )
}

/**
 * Add RepeatableJob
 */
export async function addRepeatableJob(
  queue: BroadcastQueue,
  userId: number
): Promise<BroadcastJob> {
  return await queue.add(
    'default',
    {
      userId
    },
    {
      jobId: `user-${userId}`,
      repeat: {
        every: BROADCAST_REPEAT_EVERY
      }
    }
  )
}

/**
 * Remove RepeatableJob
 */
export async function removeRepeatableJob(queue: BroadcastQueue, userId: number): Promise<boolean> {
  return await queue.removeRepeatable(
    'default',
    {
      every: BROADCAST_REPEAT_EVERY
    },
    `user-${userId}`
  )
}

/**
 * Close Queue
 */
export async function closeQueue(queue: BroadcastQueue): Promise<void> {
  await queue.close()
}

/**
 * Get Worker concurrency from config
 */
export function getWorkerConcurrency<T extends BroadcastConfig>(config: T): number {
  return config.BROADCAST_CONCURRENCY
}

/**
 * Get Worker limiter from config
 */
export function getWorkerLimiter<T extends BroadcastConfig>(config: T): RateLimiterOptions {
  return {
    max: config.BROADCAST_LIMITER_MAX,
    duration: config.BROADCAST_LIMITER_DURATION
  }
}

/**
 * Initialize Worker
 */
export function initWorker(
  processor: BroadcastProcessor,
  connection: ConnectionOptions,
  concurrency: number,
  limiter: RateLimiterOptions,
  logger: Logger
): BroadcastWorker {
  return initBaseWorker<BroadcastData, BroadcastResult, BroadcastName>(
    BROADCAST_QUEUE_NAME,
    processor,
    connection,
    concurrency,
    limiter,
    logger
  )
}

/**
 * Run Worker
 */
export async function runWorker(worker: BroadcastWorker, logger: Logger): Promise<void> {
  await runBaseWorker<BroadcastData, BroadcastResult, BroadcastName>(worker, logger)
}
