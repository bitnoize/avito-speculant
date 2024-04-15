import { Logger } from '@avito-speculant/logger'
import { ConnectionOptions, RateLimiterOptions } from 'bullmq'
import {
  PROXYCHECK_QUEUE_NAME,
  ProxycheckConfig,
  ProxycheckName,
  ProxycheckData,
  ProxycheckResult,
  ProxycheckQueue,
  ProxycheckJob,
  ProxycheckWorker,
  ProxycheckProcessor
} from './proxycheck.js'
import { initBaseQueue, initBaseWorker, runBaseWorker } from '../queue.service.js'

/**
 * Initialize Queue
 */
export function initQueue(connection: ConnectionOptions, logger: Logger): ProxycheckQueue {
  return initBaseQueue<ProxycheckData, ProxycheckResult, ProxycheckName>(
    PROXYCHECK_QUEUE_NAME,
    connection,
    logger
  )
}

/**
 * Add Job
 */
export async function addJob(queue: ProxycheckQueue, proxyId: number): Promise<ProxycheckJob> {
  return await queue.add(
    'default',
    {
      proxyId
    },
    {
      jobId: `proxy-${proxyId}`
    }
  )
}

/**
 * Close Queue
 */
export async function closeQueue(queue: ProxycheckQueue): Promise<void> {
  await queue.close()
}

/**
 * Get Worker concurrency from config
 */
export function getWorkerConcurrency<T extends ProxycheckConfig>(config: T): number {
  return config.PROXYCHECK_CONCURRENCY
}

/**
 * Get Worker limiter from config
 */
export function getWorkerLimiter<T extends ProxycheckConfig>(config: T): RateLimiterOptions {
  return {
    max: config.PROXYCHECK_LIMITER_MAX,
    duration: config.PROXYCHECK_LIMITER_DURATION
  }
}

/**
 * Initialize Worker
 */
export function initWorker(
  processor: ProxycheckProcessor,
  connection: ConnectionOptions,
  concurrency: number,
  limiter: RateLimiterOptions,
  logger: Logger
): ProxycheckWorker {
  return initBaseWorker<ProxycheckData, ProxycheckResult, ProxycheckName>(
    PROXYCHECK_QUEUE_NAME,
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
export async function runWorker(worker: ProxycheckWorker, logger: Logger): Promise<void> {
  await runBaseWorker<ProxycheckData, ProxycheckResult, ProxycheckName>(worker, logger)
}
