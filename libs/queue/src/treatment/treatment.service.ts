import { Logger } from '@avito-speculant/logger'
import { ConnectionOptions, RateLimiterOptions, Queue, Worker, MetricsTime } from 'bullmq'
import {
  TREATMENT_QUEUE_NAME,
  DEFAULT_TREATMENT_CONCURRENCY,
  DEFAULT_TREATMENT_LIMITER_MAX,
  DEFAULT_TREATMENT_LIMITER_DURATION,
  TreatmentConfig,
  TreatmentData,
  TreatmentQueue,
  TreatmentJob,
  TreatmentWorker,
  TreatmentProcessor
} from './treatment.js'

/**
 * Initialize Queue
 */
export function initQueue(connection: ConnectionOptions, logger: Logger): TreatmentQueue {
  const queue = new Queue<TreatmentData>(TREATMENT_QUEUE_NAME, {
    connection
  })

  queue.on('error', (error) => {
    logger.error(error, `There was an error in the TreatmentQueue`)
  })

  return queue
}

/**
 * Add Job
 */
export async function addJob(
  queue: TreatmentQueue,
  name: string,
  entityId: number
): Promise<TreatmentJob> {
  return await queue.add(name, { entityId })
}

/**
 * Add Jobs
 */
export async function addJobs(
  queue: TreatmentQueue,
  name: string,
  entityIds: number[]
): Promise<TreatmentJob[]> {
  return await queue.addBulk(entityIds.map((entityId) => ({ name, data: { entityId } })))
}

/**
 * Close Queue
 */
export async function closeQueue(queue: TreatmentQueue): Promise<void> {
  await queue.close()
}

/**
 * Get Worker concurrency from config
 */
export function getWorkerConcurrency<T extends TreatmentConfig>(config: T): number {
  return config.TREATMENT_CONCURRENCY
}

/**
 * Get Worker limiter from config
 */
export function getWorkerLimiter<T extends TreatmentConfig>(config: T): RateLimiterOptions {
  return {
    max: config.TREATMENT_LIMITER_MAX,
    duration: config.TREATMENT_LIMITER_DURATION
  }
}

/**
 * Initialize Worker
 */
export function initWorker(
  processor: TreatmentProcessor,
  connection: ConnectionOptions,
  concurrency: number,
  limiter: RateLimiterOptions,
  logger: Logger
): TreatmentWorker {
  const worker = new Worker<TreatmentData>(TREATMENT_QUEUE_NAME, processor, {
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
    logger.error(error, `There was an error in the TreatmentWorker`)
  })

  return worker
}

/**
 * Run Worker
 */
export async function runWorker(worker: TreatmentWorker): Promise<void> {
  await worker.run()
}

/**
 * Close Worker
 */
export async function closeWorker(worker: TreatmentWorker): Promise<void> {
  await worker.close()
}
