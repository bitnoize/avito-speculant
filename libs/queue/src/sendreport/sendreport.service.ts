import { Logger } from '@avito-speculant/logger'
import { ConnectionOptions, RateLimiterOptions, Queue, Worker, MetricsTime } from 'bullmq'
import {
  SENDREPORT_QUEUE_NAME,
  DEFAULT_SENDREPORT_CONCURRENCY,
  DEFAULT_SENDREPORT_LIMITER_MAX,
  DEFAULT_SENDREPORT_LIMITER_DURATION,
  SendreportConfig,
  SendreportData,
  SendreportQueue,
  SendreportJob,
  SendreportWorker,
  SendreportProcessor
} from './sendreport.js'

/**
 * Initialize Queue
 */
export function initQueue(connection: ConnectionOptions, logger: Logger): SendreportQueue {
  const queue = new Queue<SendreportData>(SENDREPORT_QUEUE_NAME, {
    connection
  })

  queue.on('error', (error) => {
    logger.error(error, `There was an error in the SendreportQueue`)
  })

  return queue
}

/**
 * Add Job
 */
export async function addJob(
  queue: SendreportQueue,
  name: string,
  userId: number,
  categoryId: number
): Promise<SendreportJob> {
  return await queue.add(name, { userId, categoryId })
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
  return config.SENDREPORT_CONCURRENCY ?? DEFAULT_SENDREPORT_CONCURRENCY
}

/**
 * Get Worker limiter from config
 */
export function getWorkerLimiter<T extends SendreportConfig>(config: T): RateLimiterOptions {
  return {
    max: config.SENDREPORT_LIMITER_MAX ?? DEFAULT_SENDREPORT_LIMITER_MAX,
    duration: config.SENDREPORT_LIMITER_DURATION ?? DEFAULT_SENDREPORT_LIMITER_DURATION
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
  const worker = new Worker<SendreportData>(SENDREPORT_QUEUE_NAME, processor, {
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
    logger.error(error, `There was an error in the SendreportWorker`)
  })

  return worker
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
