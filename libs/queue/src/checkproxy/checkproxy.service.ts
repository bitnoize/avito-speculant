import { Logger } from '@avito-speculant/logger'
import { ConnectionOptions, RateLimiterOptions } from 'bullmq'
import {
  CHECKPROXY_QUEUE_NAME,
  CheckproxyConfig,
  CheckproxyName,
  CheckproxyData,
  CheckproxyResult,
  CheckproxyQueue,
  CheckproxyJob,
  CheckproxyWorker,
  CheckproxyProcessor
} from './checkproxy.js'
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
export function initQueue(connection: ConnectionOptions, logger: Logger): CheckproxyQueue {
  return initQueueBase<CheckproxyData, CheckproxyResult, CheckproxyName>(
    CHECKPROXY_QUEUE_NAME,
    connection,
    logger
  )
}

/**
 * Add Job
 */
export async function addJob(queue: CheckproxyQueue, proxyId: number): Promise<CheckproxyJob> {
  return await queue.add(
    'default',
    {
      proxyId
    },
    {
      jobId: `default-${proxyId}`
    }
  )
}

/**
 * Get QueueSummary
 */
export async function getQueueSummary(queue: CheckproxyQueue): Promise<QueueSummary> {
  return await getQueueSummaryBase<CheckproxyData, CheckproxyResult, CheckproxyName>(queue)
}

/**
 * Close Queue
 */
export async function closeQueue(queue: CheckproxyQueue): Promise<void> {
  await closeQueueBase<CheckproxyData, CheckproxyResult, CheckproxyName>(queue)
}

/**
 * Get Worker concurrency from config
 */
export function getWorkerConcurrency<T extends CheckproxyConfig>(config: T): number {
  return config.CHECKPROXY_CONCURRENCY
}

/**
 * Get Worker limiter from config
 */
export function getWorkerLimiter<T extends CheckproxyConfig>(config: T): RateLimiterOptions {
  return {
    max: config.CHECKPROXY_LIMITER_MAX,
    duration: config.CHECKPROXY_LIMITER_DURATION
  }
}

/**
 * Initialize Worker
 */
export function initWorker(
  processor: CheckproxyProcessor,
  connection: ConnectionOptions,
  concurrency: number,
  limiter: RateLimiterOptions,
  logger: Logger
): CheckproxyWorker {
  return initWorkerBase<CheckproxyData, CheckproxyResult, CheckproxyName>(
    CHECKPROXY_QUEUE_NAME,
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
export async function runWorker(worker: CheckproxyWorker, logger: Logger): Promise<void> {
  await runWorkerBase<CheckproxyData, CheckproxyResult, CheckproxyName>(worker, logger)
}
