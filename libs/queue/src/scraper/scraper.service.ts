import { Logger } from '@avito-speculant/logger'
import {
  ConnectionOptions,
  RateLimiterOptions,
  Queue,
  Worker,
  MetricsTime
} from 'bullmq'
import {
  SCRAPER_QUEUE_NAME,
  ScraperConfig,
  ScraperData,
  ScraperResult,
  ScraperQueue,
  ScraperJob,
  ScraperWorker,
  ScraperProcessor
} from './scraper.js'

/**
 * Initialize Queue instance
 */
export function initQueue(
  connection: ConnectionOptions,
  logger: Logger
): ScraperQueue {
  const queue = new Queue<ScraperData, ScraperResult>(SCRAPER_QUEUE_NAME, {
    connection
  })

  queue.on('error', (error) => {
    logger.error(error, `There was an error in the ScraperQueue`)
  })

  logger.debug(`ScraperQueue successfully initialized`)

  return queue
}

/**
 * Add Job
 */
export async function addRepeatableJob(scraper: ScraperQueue): Promise<ScraperJob> {
  return await scraper.add(`scraper-bla-bla-job`, undefined, {
    repeat: {
      every: 10_000
    }
  })
}

/**
 * Close Queue instance
 */
export async function closeQueue(
  queue: ScraperQueue,
  logger: Logger
): Promise<void> {
  await queue.close()

  logger.debug(`ScraperQueue successfully closed`)
}

/**
 * Get Worker concurrency from config
 */
export function getWorkerConcurrency<T extends ScraperConfig>(config: T): number {
  return config.SCRAPER_CONCURRENCY
}

/**
 * Get Worker limiter from config
 */
export function getWorkerLimiter<T extends ScraperConfig>(
  config: T
): RateLimiterOptions {
  return {
    max: config.SCRAPER_LIMITER_MAX,
    duration: config.SCRAPER_LIMITER_DURATION
  }
}

/**
 * Initialize Worker instance
 */
export function initWorker(
  processor: ScraperProcessor,
  connection: ConnectionOptions,
  concurrency: number,
  limiter: RateLimiterOptions,
  logger: Logger
): ScraperWorker {
  const worker = new Worker<ScraperData, ScraperResult>(
    SCRAPER_QUEUE_NAME,
    processor,
    {
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
  )

  worker.on('error', (error) => {
    logger.error(error, `There was an error in the ScraperWorker`)
  })

  worker.on('completed', (job: ScraperJob, result: ScraperResult) => {
    logger.info(result, `ScraperJob complete result`)
  })

  logger.debug(`ScraperWorker successfully initialized`)

  return worker
}

/**
 * Start Worker
 */
export async function startWorker(
  worker: ScraperWorker,
  logger: Logger
): Promise<void> {
  await worker.run()

  logger.debug(`ScraperWorker successfully started`)
}

/**
 * Close Worker instance
 */
export async function closeWorker(
  worker: ScraperWorker,
  logger: Logger
): Promise<void> {
  await worker.close()

  logger.debug(`ScraperWorker successfully closed`)
}
