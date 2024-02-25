import { Logger } from '@avito-speculant/logger'
import {
  ConnectionOptions,
  RateLimiterOptions,
  Queue,
  QueueEvents,
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
 * Initialize Queue
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

  return queue
}

/**
 * Initialize QueueEvents
 */
export function initQueueEvents(
  connection: ConnectionOptions,
  logger: Logger
): QueueEvents {
  const queueEvents = new QueueEvents(SCRAPER_QUEUE_NAME, {
    connection,
    autorun: false
  })

  queueEvents.on('error', (error) => {
    logger.error(error, `There was an error in the ScraperQueue`)
  })

  return queueEvents
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
 * Initialize Worker
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
        count: 0
      },
      removeOnFail: {
        count: 0
      },
      metrics: {
        maxDataPoints: MetricsTime.ONE_WEEK
      }
    }
  )

  worker.on('error', (error) => {
    logger.error(error, `There was an error in the ScraperWorker`)
  })

  return worker
}
