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
import { initBaseQueue, initBaseWorker } from '../queue.service.js'

/**
 * Initialize Queue
 */
export function initQueue(connection: ConnectionOptions, logger: Logger): SendreportQueue {
  return initBaseQueue<SendreportData, SendreportResult, SendreportName>(
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
  reportIds: string[]
): Promise<SendreportJob[]> {
  return await queue.addBulk(
    reportIds.map((reportId) => ({
      name: 'default',
      data: {
        reportId
      },
      opts: {
        jobId: `report-${reportId}`
      }
    }))
  )
}

/**
 * Close Queue
 */
export async function closeQueue(queue: SendreportQueue): Promise<void> {
  await queue.close()
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
  return initBaseWorker<SendreportData, SendreportResult, SendreportName>(
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
export async function runWorker(worker: SendreportWorker): Promise<void> {
  await worker.run()
}

/**
 * Close Worker
 */
export async function closeWorker(worker: SendreportWorker): Promise<void> {
  await worker.close()
}
