import { Logger } from '@avito-speculant/logger'
import { ConnectionOptions, RateLimiterOptions } from 'bullmq'
import {
  SCRAPING_QUEUE_NAME,
  ScrapingConfig,
  ScrapingName,
  ScrapingData,
  ScrapingResult,
  ScrapingQueue,
  ScrapingJob,
  ScrapingWorker,
  ScrapingProcessor
} from './scraping.js'
import { initBaseQueue, initBaseWorker } from '../queue.service.js'

/**
 * Initialize Queue
 */
export function initQueue(connection: ConnectionOptions, logger: Logger): ScrapingQueue {
  return initBaseQueue<ScrapingData, ScrapingResult, ScrapingName>(
    SCRAPING_QUEUE_NAME,
    connection,
    logger
  )
}

/**
 * Add Job
 */
export async function addJob(
  queue: ScrapingQueue,
  name: ScrapingName,
  every: number,
  jobId: string
): Promise<ScrapingJob> {
  const job = await queue.add(
    name,
    {
      scraperJobId: jobId
    },
    {
      jobId,
      repeat: {
        every
      }
    }
  )

  return job
}

/**
 * Close Queue
 */
export async function closeQueue(queue: ScrapingQueue): Promise<void> {
  await queue.close()
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
  return initBaseWorker<ScrapingData, ScrapingResult, ScrapingName>(
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
export async function runWorker(worker: ScrapingWorker): Promise<void> {
  await worker.run()
}

/**
 * Close Worker
 */
export async function closeWorker(worker: ScrapingWorker): Promise<void> {
  await worker.close()
}
