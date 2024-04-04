import { Logger } from '@avito-speculant/logger'
import { ConnectionOptions, RateLimiterOptions } from 'bullmq'
import {
  HERALDING_QUEUE_NAME,
  HeraldingConfig,
  HeraldingName,
  HeraldingData,
  HeraldingResult,
  HeraldingQueue,
  HeraldingJob,
  HeraldingWorker,
  HeraldingProcessor
} from './heralding.js'
import { initBaseQueue, initBaseWorker } from '../queue.service.js'

/**
 * Initialize Queue
 */
export function initQueue(connection: ConnectionOptions, logger: Logger): HeraldingQueue {
  return initBaseQueue<HeraldingData, HeraldingResult, HeraldingName>(
    HERALDING_QUEUE_NAME,
    connection,
    logger
  )
}

/**
 * Add Job
 */
export async function addJob(
  queue: HeraldingQueue,
  userId: number,
  everySec: number
): Promise<HeraldingJob> {
  const jobId = 'user-' + userId
  const every = everySec * 1000
  return await queue.add(
    'default',
    {
      userId
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
 * Remove Job
 */
export async function removeJob(
  queue: HeraldingQueue,
  userId: string,
  everySec: number
): Promise<boolean> {
  const jobId = 'user-' + userId
  const every = everySec * 1000
  return await queue.removeRepeatable(
    'default',
    {
      every
    },
    jobId
  )
}

/**
 * Close Queue
 */
export async function closeQueue(queue: HeraldingQueue): Promise<void> {
  await queue.close()
}

/**
 * Get Worker concurrency from config
 */
export function getWorkerConcurrency<T extends HeraldingConfig>(config: T): number {
  return config.HERALDING_CONCURRENCY
}

/**
 * Get Worker limiter from config
 */
export function getWorkerLimiter<T extends HeraldingConfig>(config: T): RateLimiterOptions {
  return {
    max: config.HERALDING_LIMITER_MAX,
    duration: config.HERALDING_LIMITER_DURATION
  }
}

/**
 * Initialize Worker
 */
export function initWorker(
  processor: HeraldingProcessor,
  connection: ConnectionOptions,
  concurrency: number,
  limiter: RateLimiterOptions,
  logger: Logger
): HeraldingWorker {
  return initBaseWorker<HeraldingData, HeraldingResult, HeraldingName>(
    HERALDING_QUEUE_NAME,
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
export async function runWorker(worker: HeraldingWorker): Promise<void> {
  await worker.run()
}

/**
 * Close Worker
 */
export async function closeWorker(worker: HeraldingWorker): Promise<void> {
  await worker.close()
}
