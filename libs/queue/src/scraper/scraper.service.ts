import { Logger } from '@avito-speculant/logger'
import { ConnectionOptions, RateLimiterOptions, Queue, Worker, MetricsTime } from 'bullmq'
import {
  SCRAPER_QUEUE_NAME,
  DEFAULT_SCRAPER_CONCURRENCY,
  DEFAULT_SCRAPER_LIMITER_MAX,
  DEFAULT_SCRAPER_LIMITER_DURATION,
  ScraperConfig,
  ScraperData,
  ScraperQueue,
  ScraperJob,
  ScraperWorker,
  ScraperProcessor
} from './scraper.js'

/**
 * Initialize Queue
 */
export function initQueue(connection: ConnectionOptions, logger: Logger): ScraperQueue {
  const queue = new Queue<ScraperData>(SCRAPER_QUEUE_NAME, {
    connection
  })

  queue.on('error', (error) => {
    logger.error(error, `There was an error in the ScraperQueue`)
  })

  return queue
}

/**
 * Add Job
 */
export async function addJob(
  queue: ScraperQueue,
  name: string,
  every: number,
  jobId: string
): Promise<ScraperJob> {
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
export async function closeQueue(queue: ScraperQueue): Promise<void> {
  await queue.close()
}

/**
 * Get Worker concurrency from config
 */
export function getWorkerConcurrency<T extends ScraperConfig>(config: T): number {
  return config.SCRAPER_CONCURRENCY ?? DEFAULT_SCRAPER_CONCURRENCY
}

/**
 * Get Worker limiter from config
 */
export function getWorkerLimiter<T extends ScraperConfig>(config: T): RateLimiterOptions {
  return {
    max: config.SCRAPER_LIMITER_MAX ?? DEFAULT_SCRAPER_LIMITER_MAX,
    duration: config.SCRAPER_LIMITER_DURATION ?? DEFAULT_SCRAPER_LIMITER_DURATION
  }
}

/**
 * Initialize Worker
 */
export function initWorker(
  processor: ScraperProcessor,
  connection: ConnectionOptions,
  concurrency: number,
  limiter: RateLimiterOptions,
  logger: Logger
): ScraperWorker {
  const worker = new Worker<ScraperData>(SCRAPER_QUEUE_NAME, processor, {
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
    logger.error(error, `There was an error in the ScraperWorker`)
  })

  return worker
}

/**
 * Run Worker
 */
export async function runWorker(worker: ScraperWorker): Promise<void> {
  await worker.run()
}

/**
 * Close Worker
 */
export async function closeWorker(worker: ScraperWorker): Promise<void> {
  await worker.close()
}
