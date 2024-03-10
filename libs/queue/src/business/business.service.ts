import { Logger } from '@avito-speculant/logger'
import { ConnectionOptions, RateLimiterOptions, Queue, Worker, MetricsTime } from 'bullmq'
import {
  BUSINESS_QUEUE_NAME,
  BusinessConfig,
  BusinessData,
  BusinessResult,
  BusinessQueue,
  BusinessJob,
  BusinessWorker,
  BusinessProcessor
} from './business.js'

/**
 * Initialize Queue
 */
export function initQueue(connection: ConnectionOptions, logger: Logger): BusinessQueue {
  const queue = new Queue<BusinessData, BusinessResult>(BUSINESS_QUEUE_NAME, {
    connection
  })

  queue.on('error', (error) => {
    logger.error(error, `There was an error in the BusinessQueue`)
  })

  return queue
}

/**
 * Add Job
 */
export async function addJob(queue: BusinessQueue, name: string, id: number): Promise<BusinessJob> {
  return await queue.add(name, { id })
}

/**
 * Add Jobs
 */
export async function addJobs(
  queue: BusinessQueue,
  name: string,
  ids: number[]
): Promise<BusinessJob[]> {
  return await queue.addBulk(ids.map((id) => ({ name, data: { id } })))
}

/**
 * Close Queue
 */
export async function closeQueue(queue: BusinessQueue): Promise<void> {
  await queue.close()
}

/**
 * Get Worker concurrency from config
 */
export function getWorkerConcurrency<T extends BusinessConfig>(config: T): number {
  return config.BUSINESS_CONCURRENCY
}

/**
 * Get Worker limiter from config
 */
export function getWorkerLimiter<T extends BusinessConfig>(config: T): RateLimiterOptions {
  return {
    max: config.BUSINESS_LIMITER_MAX,
    duration: config.BUSINESS_LIMITER_DURATION
  }
}

/**
 * Initialize Worker
 */
export function initWorker(
  processor: BusinessProcessor,
  connection: ConnectionOptions,
  concurrency: number,
  limiter: RateLimiterOptions,
  logger: Logger
): BusinessWorker {
  const worker = new Worker<BusinessData, BusinessResult>(BUSINESS_QUEUE_NAME, processor, {
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
    logger.error(error, `There was an error in the BusinessWorker`)
  })

  return worker
}

/**
 * Run Worker
 */
export async function runWorker(worker: BusinessWorker): Promise<void> {
  await worker.run()
}

/**
 * Close Worker
 */
export async function closeWorker(worker: BusinessWorker): Promise<void> {
  await worker.close()
}
