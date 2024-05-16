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
import { QueueSummary } from '../queue.js'
import {
  initQueueBase,
  getQueueSummaryBase,
  closeQueueBase,
  initWorkerBase,
  runWorkerBase
} from '../queue.service.js'

/**
 * Initialize Queue
 */
export function initQueue(connection: ConnectionOptions, logger: Logger): BroadcastQueue {
  return initQueueBase<BroadcastData, BroadcastResult, BroadcastName>(
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
  categoryId: number
): Promise<BroadcastJob> {
  return await queue.add(
    'default',
    {
      categoryId
    },
    {
      jobId: `default-${categoryId}`,
      repeat: {
        every: BROADCAST_REPEAT_EVERY
      }
    }
  )
}

/**
 * Remove RepeatableJob
 */
export async function removeRepeatableJob(
  queue: BroadcastQueue,
  categoryId: number
): Promise<boolean> {
  return await queue.removeRepeatable(
    'default',
    {
      every: BROADCAST_REPEAT_EVERY
    },
    `default-${categoryId}`
  )
}

/**
 * Get QueueSummary
 */
export async function getQueueSummary(queue: BroadcastQueue): Promise<QueueSummary> {
  return await getQueueSummaryBase<BroadcastData, BroadcastResult, BroadcastName>(queue)
}

/**
 * Close Queue
 */
export async function closeQueue(queue: BroadcastQueue): Promise<void> {
  await closeQueueBase<BroadcastData, BroadcastResult, BroadcastName>(queue)
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
  return initWorkerBase<BroadcastData, BroadcastResult, BroadcastName>(
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
  await runWorkerBase<BroadcastData, BroadcastResult, BroadcastName>(worker, logger)
}
