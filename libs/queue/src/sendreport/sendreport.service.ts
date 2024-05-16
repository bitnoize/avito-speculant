import { Logger } from '@avito-speculant/logger'
import { ConnectionOptions, RateLimiterOptions } from 'bullmq'
import {
  SENDREPORT_QUEUE_NAME,
  SendreportConfig,
  SendreportName,
  SendreportData,
  SendreportResult,
  SendreportQueue,
  SendreportJob,
  SendreportWorker,
  SendreportProcessor
} from './sendreport.js'
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
export function initQueue(connection: ConnectionOptions, logger: Logger): SendreportQueue {
  return initQueueBase<SendreportData, SendreportResult, SendreportName>(
    SENDREPORT_QUEUE_NAME,
    connection,
    logger
  )
}

/**
 * Add Jobs
 */
export async function addJobs(
  queue: SendreportQueue,
  reportIds: [number, number][]
): Promise<SendreportJob[]> {
  return await queue.addBulk(
    reportIds.map((reportId) => {
      const [categoryId, advertId] = reportId

      return {
        name: 'default',
        data: {
          categoryId,
          advertId
        },
        opts: {
          jobId: `default-${categoryId}-${advertId}`
        }
      }
    })
  )
}

/**
 * Get QueueSummary
 */
export async function getQueueSummary(queue: SendreportQueue): Promise<QueueSummary> {
  return await getQueueSummaryBase<SendreportData, SendreportResult, SendreportName>(queue)
}

/**
 * Close Queue
 */
export async function closeQueue(queue: SendreportQueue): Promise<void> {
  await closeQueueBase<SendreportData, SendreportResult, SendreportName>(queue)
}

/**
 * Get Worker concurrency from config
 */
export function getWorkerConcurrency<T extends SendreportConfig>(config: T): number {
  return config.SENDREPORT_CONCURRENCY
}

/**
 * Get Worker limiter from config
 */
export function getWorkerLimiter<T extends SendreportConfig>(config: T): RateLimiterOptions {
  return {
    max: config.SENDREPORT_LIMITER_MAX,
    duration: config.SENDREPORT_LIMITER_DURATION
  }
}

/**
 * Initialize Worker
 */
export function initWorker(
  processor: SendreportProcessor,
  connection: ConnectionOptions,
  concurrency: number,
  limiter: RateLimiterOptions,
  logger: Logger
): SendreportWorker {
  return initWorkerBase<SendreportData, SendreportResult, SendreportName>(
    SENDREPORT_QUEUE_NAME,
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
export async function runWorker(worker: SendreportWorker, logger: Logger): Promise<void> {
  await runWorkerBase<SendreportData, SendreportResult, SendreportName>(worker, logger)
}
