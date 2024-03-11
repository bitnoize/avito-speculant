import { Logger } from '@avito-speculant/logger'
import { ConnectionOptions, RateLimiterOptions, Queue, Worker, MetricsTime } from 'bullmq'
import {
  PROXYCHECK_QUEUE_NAME,
  ProxycheckConfig,
  ProxycheckData,
  ProxycheckResult,
  ProxycheckQueue,
  ProxycheckJob,
  ProxycheckWorker,
  ProxycheckProcessor
} from './proxycheck.js'

/**
 * Initialize Queue
 */
export function initQueue(connection: ConnectionOptions, logger: Logger): ProxycheckQueue {
  const queue = new Queue<ProxycheckData, ProxycheckResult>(PROXYCHECK_QUEUE_NAME, {
    connection
  })

  queue.on('error', (error) => {
    logger.error(error, `There was an error in the ProxycheckQueue`)
  })

  return queue
}

/**
 * Add Job
 */
export async function addJob(
  queue: ProxycheckQueue,
  name: string,
  proxyId: number
): Promise<ProxycheckJob> {
  return await queue.add(name, { proxyId })
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
  const worker = new Worker<ProxycheckData, ProxycheckResult>(PROXYCHECK_QUEUE_NAME, processor, {
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
    logger.error(error, `There was an error in the ProxycheckWorker`)
  })

  return worker
}

/**
 * Run Worker
 */
export async function runWorker(worker: ProxycheckWorker): Promise<void> {
  await worker.run()
}

/**
 * Close Worker
 */
export async function closeWorker(worker: ProxycheckWorker): Promise<void> {
  await worker.close()
}
