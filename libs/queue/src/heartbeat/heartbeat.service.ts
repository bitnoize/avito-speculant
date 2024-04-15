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
import { initBaseQueue, initBaseWorker, runBaseWorker } from '../queue.service.js'

/**
 * Initialize Queue
 */
export function initQueue(connection: ConnectionOptions, logger: Logger): HeartbeatQueue {
  return initBaseQueue<HeartbeatData, HeartbeatResult, HeartbeatName>(
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
 * Close Queue
 */
export async function closeQueue(queue: HeartbeatQueue): Promise<void> {
  await queue.close()
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
  return initBaseWorker<HeartbeatData, HeartbeatResult, HeartbeatName>(
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
  await runBaseWorker<HeartbeatData, HeartbeatResult, HeartbeatName>(worker, logger)
}
