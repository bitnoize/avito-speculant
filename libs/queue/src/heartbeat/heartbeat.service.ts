import { Logger } from '@avito-speculant/logger'
import { ConnectionOptions, RateLimiterOptions } from 'bullmq'
import {
  HEARTBEAT_QUEUE_NAME,
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
import { initBaseQueue, initBaseWorker } from '../queue.service.js'

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
 * Add Job
 */
export async function addJob(
  queue: HeartbeatQueue,
  jobId: string,
  every: number
): Promise<HeartbeatJob> {
  return await queue.add(
    'pulse',
    {
      step: HEARTBEAT_STEPS[0]
    },
    {
      jobId,
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
export async function runWorker(worker: HeartbeatWorker): Promise<void> {
  await worker.run()
}

/**
 * Close Worker
 */
export async function closeWorker(worker: HeartbeatWorker): Promise<void> {
  await worker.close()
}
