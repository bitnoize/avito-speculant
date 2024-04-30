import { Logger } from '@avito-speculant/logger'
import { ConnectionOptions, RateLimiterOptions } from 'bullmq'
import {
  CHECKBOT_QUEUE_NAME,
  CheckbotConfig,
  CheckbotName,
  CheckbotData,
  CheckbotResult,
  CheckbotQueue,
  CheckbotJob,
  CheckbotWorker,
  CheckbotProcessor
} from './checkbot.js'
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
export function initQueue(connection: ConnectionOptions, logger: Logger): CheckbotQueue {
  return initQueueBase<CheckbotData, CheckbotResult, CheckbotName>(
    CHECKBOT_QUEUE_NAME,
    connection,
    logger
  )
}

/**
 * Add Job
 */
export async function addJob(queue: CheckbotQueue, botId: number): Promise<CheckbotJob> {
  return await queue.add(
    'default',
    {
      botId
    },
    {
      jobId: `default-${botId}`
    }
  )
}

/**
 * Get QueueSummary
 */
export async function getQueueSummary(queue: CheckbotQueue): Promise<QueueSummary> {
  return await getQueueSummaryBase<CheckbotData, CheckbotResult, CheckbotName>(queue)
}

/**
 * Close Queue
 */
export async function closeQueue(queue: CheckbotQueue): Promise<void> {
  await closeQueueBase<CheckbotData, CheckbotResult, CheckbotName>(queue)
}

/**
 * Get Worker concurrency from config
 */
export function getWorkerConcurrency<T extends CheckbotConfig>(config: T): number {
  return config.CHECKBOT_CONCURRENCY
}

/**
 * Get Worker limiter from config
 */
export function getWorkerLimiter<T extends CheckbotConfig>(config: T): RateLimiterOptions {
  return {
    max: config.CHECKBOT_LIMITER_MAX,
    duration: config.CHECKBOT_LIMITER_DURATION
  }
}

/**
 * Initialize Worker
 */
export function initWorker(
  processor: CheckbotProcessor,
  connection: ConnectionOptions,
  concurrency: number,
  limiter: RateLimiterOptions,
  logger: Logger
): CheckbotWorker {
  return initWorkerBase<CheckbotData, CheckbotResult, CheckbotName>(
    CHECKBOT_QUEUE_NAME,
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
export async function runWorker(worker: CheckbotWorker, logger: Logger): Promise<void> {
  await runWorkerBase<CheckbotData, CheckbotResult, CheckbotName>(worker, logger)
}
