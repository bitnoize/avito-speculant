import { Logger } from '@avito-speculant/logger'
import { ConnectionOptions, RateLimiterOptions } from 'bullmq'
import {
  THROTTLE_QUEUE_NAME,
  THROTTLE_REPEAT_EVERY,
  ThrottleConfig,
  ThrottleName,
  ThrottleData,
  ThrottleResult,
  ThrottleQueue,
  ThrottleJob,
  ThrottleWorker,
  ThrottleProcessor
} from './throttle.js'
import { initBaseQueue, initBaseWorker } from '../queue.service.js'

/**
 * Initialize Queue
 */
export function initQueue(connection: ConnectionOptions, logger: Logger): ThrottleQueue {
  return initBaseQueue<ThrottleData, ThrottleResult, ThrottleName>(
    THROTTLE_QUEUE_NAME,
    connection,
    logger
  )
}

/**
 * Add RepeatableJob
 */
export async function addRepeatableJob(queue: ThrottleQueue): Promise<ThrottleJob> {
  return await queue.add(
    'default',
    undefined,
    {
      repeat: {
        every: THROTTLE_REPEAT_EVERY
      }
    }
  )
}

/**
 * Remove RepeatableJob
 */
export async function removeRepeatableJob(queue: ThrottleQueue): Promise<boolean> {
  return await queue.removeRepeatable(
    'default',
    {
      every: THROTTLE_REPEAT_EVERY
    }
  )
}

/**
 * Close Queue
 */
export async function closeQueue(queue: ThrottleQueue): Promise<void> {
  await queue.close()
}

/**
 * Get Worker concurrency from config
 */
export function getWorkerConcurrency<T extends ThrottleConfig>(config: T): number {
  return config.THROTTLE_CONCURRENCY
}

/**
 * Get Worker limiter from config
 */
export function getWorkerLimiter<T extends ThrottleConfig>(config: T): RateLimiterOptions {
  return {
    max: config.THROTTLE_LIMITER_MAX,
    duration: config.THROTTLE_LIMITER_DURATION
  }
}

/**
 * Initialize Worker
 */
export function initWorker(
  processor: ThrottleProcessor,
  connection: ConnectionOptions,
  concurrency: number,
  limiter: RateLimiterOptions,
  logger: Logger
): ThrottleWorker {
  return initBaseWorker<ThrottleData, ThrottleResult, ThrottleName>(
    THROTTLE_QUEUE_NAME,
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
export async function runWorker(worker: ThrottleWorker): Promise<void> {
  await worker.run()
}

/**
 * Close Worker
 */
export async function closeWorker(worker: ThrottleWorker): Promise<void> {
  await worker.close()
}
