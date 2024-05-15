import { Logger } from '@avito-speculant/logger'
import { ConnectionOptions, RateLimiterOptions } from 'bullmq'
import {
  SCRAPING_QUEUE_NAME,
  SCRAPING_REPEAT_EVERY,
  ScrapingConfig,
  ScrapingName,
  ScrapingData,
  ScrapingResult,
  ScrapingQueue,
  ScrapingJob,
  ScrapingWorker,
  ScrapingProcessor
} from './scraping.js'
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
export function initQueue(connection: ConnectionOptions, logger: Logger): ScrapingQueue {
  return initQueueBase<ScrapingData, ScrapingResult, ScrapingName>(
    SCRAPING_QUEUE_NAME,
    connection,
    logger
  )
}

/**
 * Add RepeatableJob
 */
export async function addRepeatableJob(
  queue: ScrapingQueue,
  scraperId: string
): Promise<ScrapingJob> {
  return await queue.add(
    'default',
    {
      scraperId
    },
    {
      jobId: scraperId,
      repeat: {
        every: SCRAPING_REPEAT_EVERY
      }
    }
  )
}

/**
 * Remove RepeatableJob
 */
export async function removeRepeatableJob(
  queue: ScrapingQueue,
  scraperId: string
): Promise<boolean> {
  return await queue.removeRepeatable(
    'default',
    {
      every: SCRAPING_REPEAT_EVERY
    },
    scraperId
  )
}

/**
 * Get QueueSummary
 */
export async function getQueueSummary(queue: ScrapingQueue): Promise<QueueSummary> {
  return await getQueueSummaryBase<ScrapingData, ScrapingResult, ScrapingName>(queue)
}

/**
 * Close Queue
 */
export async function closeQueue(queue: ScrapingQueue): Promise<void> {
  await closeQueueBase<ScrapingData, ScrapingResult, ScrapingName>(queue)
}

/**
 * Get Worker concurrency from config
 */
export function getWorkerConcurrency<T extends ScrapingConfig>(config: T): number {
  return config.SCRAPING_CONCURRENCY
}

/**
 * Get Worker limiter from config
 */
export function getWorkerLimiter<T extends ScrapingConfig>(config: T): RateLimiterOptions {
  return {
    max: config.SCRAPING_LIMITER_MAX,
    duration: config.SCRAPING_LIMITER_DURATION
  }
}

/**
 * Initialize Worker
 */
export function initWorker(
  processor: ScrapingProcessor,
  connection: ConnectionOptions,
  concurrency: number,
  limiter: RateLimiterOptions,
  logger: Logger
): ScrapingWorker {
  return initWorkerBase<ScrapingData, ScrapingResult, ScrapingName>(
    SCRAPING_QUEUE_NAME,
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
export async function runWorker(worker: ScrapingWorker, logger: Logger): Promise<void> {
  await runWorkerBase<ScrapingData, ScrapingResult, ScrapingName>(worker, logger)
}
