import { Logger } from '@avito-speculant/logger'
import { ConnectionOptions, RateLimiterOptions } from 'bullmq'
import {
  HEARTBEAT_QUEUE_NAME,
  HEARTBEAT_REPEAT_EVERY,
  HEARTBEAT_STEPS,
  HeartbeatConfig,
  HeartbeatName,
  HeartbeatData,
  HeartbeatResult,
  HeartbeatQueue,
  HeartbeatJob,
  HeartbeatWorker,
  HeartbeatProcessor
} from './heartbeat.js'
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
export function initQueue(connection: ConnectionOptions, logger: Logger): HeartbeatQueue {
  return initQueueBase<HeartbeatData, HeartbeatResult, HeartbeatName>(
    HEARTBEAT_QUEUE_NAME,
    connection,
    logger
  )
}

/**
 * Add RepeatableJob
 */
export async function addRepeatableJob(queue: HeartbeatQueue): Promise<HeartbeatJob> {
  return await queue.add(
    'default',
    {
      step: HEARTBEAT_STEPS[0]
    },
    {
      repeat: {
        every: HEARTBEAT_REPEAT_EVERY
      }
    }
  )
}

/**
 * Remove RepeatableJob
 */
export async function removeRepeatableJob(queue: HeartbeatQueue): Promise<boolean> {
  return await queue.removeRepeatable('default', {
    every: HEARTBEAT_REPEAT_EVERY
  })
}

/**
 * Get QueueSummary
 */
export async function getQueueSummary(queue: HeartbeatQueue): Promise<QueueSummary> {
  return await getQueueSummaryBase<HeartbeatData, HeartbeatResult, HeartbeatName>(queue)
}

/**
 * Close Queue
 */
export async function closeQueue(queue: HeartbeatQueue): Promise<void> {
  await closeQueueBase<HeartbeatData, HeartbeatResult, HeartbeatName>(queue)
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
export function getWorkerLimiter<T extends HeartbeatConfig>(config: T): RateLimiterOptions {
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
  return initWorkerBase<HeartbeatData, HeartbeatResult, HeartbeatName>(
    HEARTBEAT_QUEUE_NAME,
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
export async function runWorker(worker: HeartbeatWorker, logger: Logger): Promise<void> {
  await runWorkerBase<HeartbeatData, HeartbeatResult, HeartbeatName>(worker, logger)
}
