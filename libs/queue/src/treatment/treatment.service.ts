import { Logger } from '@avito-speculant/logger'
import { ConnectionOptions, RateLimiterOptions } from 'bullmq'
import {
  TREATMENT_QUEUE_NAME,
  TreatmentConfig,
  TreatmentName,
  TreatmentData,
  TreatmentResult,
  TreatmentQueue,
  TreatmentJob,
  TreatmentWorker,
  TreatmentProcessor
} from './treatment.js'
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
export function initQueue(connection: ConnectionOptions, logger: Logger): TreatmentQueue {
  return initQueueBase<TreatmentData, TreatmentResult, TreatmentName>(
    TREATMENT_QUEUE_NAME,
    connection,
    logger
  )
}

/**
 * Add Job
 */
export async function addJob(
  queue: TreatmentQueue,
  name: TreatmentName,
  entityId: number
): Promise<TreatmentJob> {
  return await queue.add(
    name,
    {
      entityId
    },
    {
      jobId: `${name}-${entityId}`
    }
  )
}

/**
 * Add Jobs
 */
export async function addJobs(
  queue: TreatmentQueue,
  name: TreatmentName,
  entityIds: number[]
): Promise<TreatmentJob[]> {
  return await queue.addBulk(
    entityIds.map((entityId) => ({
      name,
      data: {
        entityId
      },
      opts: {
        jobId: `${name}-${entityId}`
      }
    }))
  )
}

/**
 * Get QueueSummary
 */
export async function getQueueSummary(queue: TreatmentQueue): Promise<QueueSummary> {
  return await getQueueSummaryBase<TreatmentData, TreatmentResult, TreatmentName>(queue)
}

/**
 * Close Queue
 */
export async function closeQueue(queue: TreatmentQueue): Promise<void> {
  await closeQueueBase<TreatmentData, TreatmentResult, TreatmentName>(queue)
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
  return initWorkerBase<TreatmentData, TreatmentResult, TreatmentName>(
    TREATMENT_QUEUE_NAME,
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
export async function runWorker(worker: TreatmentWorker, logger: Logger): Promise<void> {
  await runWorkerBase<TreatmentData, TreatmentResult, TreatmentName>(worker, logger)
}
