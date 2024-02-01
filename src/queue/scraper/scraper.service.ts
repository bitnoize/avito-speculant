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
  ScraperData,
  ScraperResult
} from './scraper.js'
import { Config } from '../../config.js'
import { Logger } from '../../logger.js'

/**
 * Initialize ScraperQueue instance
 */
export async function initScraperQueue(
  connection: ConnectionOptions,
  logger: Logger
): Promise<Queue<ScraperData, ScraperResult>> {
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
 * Get ScraperWorkerConcurrency from config
 */
export function getScraperWorkerConcurrency(config: Config): number {
  const concurrency: number = config.SCRAPER_CONCURRENCY

  return concurrency
}

/**
 * Get ScraperWorkerLimiter from config
 */
export function getScraperWorkerLimiter(config: Config): RateLimiterOptions {
  const limiter: RateLimiterOptions = {
    max: config.SCRAPER_LIMITER_MAX,
    duration: config.SCRAPER_LIMITER_DURATION
  }

  return limiter
}

/**
 * Initialize ScraperWorker instance
 */
export async function initScraperWorker(
  processor: Processor<ScraperData, ScraperResult>,
  connection: ConnectionOptions,
  concurrency: number,
  limiter: RateLimiterOptions,
  logger: Logger
): Promise<Worker<ScraperData, ScraperResult>> {
  const workerOptions: WorkerOptions = {
    connection,
    concurrency,
    limiter,
    removeOnComplete: {
      count: 0
    },
    removeOnFail: {
      count: 0
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
