import { Logger } from '@avito-speculant/logger'
import {
  ConnectionOptions,
  QueueOptions,
  WorkerOptions,
  RateLimiterOptions,
  Queue,
  Worker,
  Processor,
  MetricsTime
} from 'bullmq'
import {
  SCRAPER_QUEUE_NAME,
  ScraperConfig,
  ScraperData,
  ScraperResult
} from './scraper.js'

/**
 * Initialize Queue instance
 */
export function initQueue(
  connection: ConnectionOptions,
  logger: Logger
): Queue<ScraperData, ScraperResult> {
  const queueOptions: QueueOptions = {
    connection
  }

  const queue = new Queue<ScraperData, ScraperResult>(
    SCRAPER_QUEUE_NAME,
    queueOptions
  )

  queue.on('error', (error) => {
    logger.error(error, `There was an error in the ScraperQueue`)
  })

  logger.debug(`ScraperQueue successfully initialized`)

  return queue
}

/**
 * Close Queue instance
 */
export async function closeQueue(
  queue: Queue<ScraperData, ScraperResult>,
  logger: Logger
): Promise<void> {
  await queue.close()

  logger.debug(`ScraperQueue successfully closed`)
}

/**
 * Get Worker concurrency from config
 */
export function getWorkerConcurrency<T extends ScraperConfig>(config: T): number {
  const concurrency: number = config.SCRAPER_CONCURRENCY

  return concurrency
}

/**
 * Get Worker limiter from config
 */
export function getWorkerLimiter<T extends ScraperConfig>(
  config: T
): RateLimiterOptions {
  const limiter: RateLimiterOptions = {
    max: config.SCRAPER_LIMITER_MAX,
    duration: config.SCRAPER_LIMITER_DURATION
  }

  return limiter
}

/**
 * Initialize Worker instance
 */
export function initWorker(
  processor: Processor<ScraperData, ScraperResult>,
  connection: ConnectionOptions,
  concurrency: number,
  limiter: RateLimiterOptions,
  logger: Logger
): Worker<ScraperData, ScraperResult> {
  const workerOptions: WorkerOptions = {
    connection,
    concurrency,
    limiter,
    removeOnComplete: {
      count: 10
    },
    removeOnFail: {
      count: 10
    },
    metrics: {
      maxDataPoints: MetricsTime.ONE_WEEK
    }
  }

  const worker = new Worker<ScraperData, ScraperResult>(
    SCRAPER_QUEUE_NAME,
    processor,
    workerOptions
  )

  worker.on('error', (error) => {
    logger.error(error, `There was an error in the ScraperWorker`)
  })

  logger.debug(`ScraperWorker successfully initialized`)

  return worker
}

/**
 * Close Worker instance
 */
export async function closeWorker(
  worker: Worker<ScraperData, ScraperResult>,
  logger: Logger
): Promise<void> {
  await worker.close()

  logger.debug(`ScraperWorker successfully closed`)
}
