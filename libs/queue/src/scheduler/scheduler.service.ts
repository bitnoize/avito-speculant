import { Logger } from '@avito-speculant/logger'
import {
  ConnectionOptions,
  RateLimiterOptions,
  Queue,
  Worker,
  MetricsTime
} from 'bullmq'
import {
  SCHEDULER_QUEUE_NAME,
  SchedulerConfig,
  SchedulerData,
  SchedulerResult,
  SchedulerQueue,
  SchedulerJob,
  SchedulerWorker,
  SchedulerProcessor
} from './scheduler.js'

/**
 * Initialize Queue instance
 */
export function initQueue(
  connection: ConnectionOptions,
  logger: Logger
): SchedulerQueue {
  const queue = new Queue<SchedulerData, SchedulerResult>(SCHEDULER_QUEUE_NAME, {
    connection
  })

  queue.on('error', (error) => {
    logger.error(error, `There was an error in the SchedulerQueue`)
  })

  logger.debug(`SchedulerQueue successfully initialized`)

  return queue
}

/**
 * Add Job
 */
export async function addRepeatableJob(
  scheduler: SchedulerQueue
): Promise<SchedulerJob> {
  return await scheduler.add(
    `schedule`,
    undefined,
    {
      repeat: {
        every: 10_000
      }
    }
  )
}

/**
 * Close Queue instance
 */
export async function closeQueue(
  queue: SchedulerQueue,
  logger: Logger
): Promise<void> {
  await queue.close()

  logger.debug(`SchedulerQueue successfully closed`)
}

/**
 * Get Worker concurrency from config
 */
export function getWorkerConcurrency<T extends SchedulerConfig>(config: T): number {
  return config.SCHEDULER_CONCURRENCY
}

/**
 * Get Worker limiter from config
 */
export function getWorkerLimiter<T extends SchedulerConfig>(
  config: T
): RateLimiterOptions {
  return {
    max: config.SCHEDULER_LIMITER_MAX,
    duration: config.SCHEDULER_LIMITER_DURATION
  }
}

/**
 * Initialize Worker instance
 */
export function initWorker(
  processor: SchedulerProcessor,
  connection: ConnectionOptions,
  concurrency: number,
  limiter: RateLimiterOptions,
  logger: Logger
): SchedulerWorker {
  const worker = new Worker<SchedulerData, SchedulerResult>(
    SCHEDULER_QUEUE_NAME,
    processor,
    {
      connection,
      concurrency,
      limiter,
      autorun: false,
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
    logger.error(error, `There was an error in the SchedulerWorker`)
  })

  worker.on('completed', (job: SchedulerJob, result: SchedulerResult) => {
    logger.info(result, `SchedulerJob complete result`)
  })

  logger.debug(`SchedulerWorker successfully initialized`)

  return worker
}

/**
 * Start Worker
 */
export async function startWorker(
  worker: SchedulerWorker,
  logger: Logger
): Promise<void> {
  await worker.run()

  logger.debug(`SchedulerWorker successfully started`)
}

/**
 * Close Worker instance
 */
export async function closeWorker(
  worker: SchedulerWorker,
  logger: Logger
): Promise<void> {
  await worker.close()

  logger.debug(`SchedulerWorker successfully closed`)
}
