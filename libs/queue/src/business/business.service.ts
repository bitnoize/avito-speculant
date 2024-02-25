import { Logger } from '@avito-speculant/logger'
import {
  ConnectionOptions,
  RateLimiterOptions,
  Queue,
  QueueEvents,
  BulkJobOptions,
  Worker,
  MetricsTime
} from 'bullmq'
import { HeartbeatJob } from '../heartbeat/heartbeat.js'
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
export function initQueue(
  connection: ConnectionOptions,
  logger: Logger
): BusinessQueue {
  const queue = new Queue<BusinessData, BusinessResult>(BUSINESS_QUEUE_NAME, {
    connection
  })

  queue.on('error', (error) => {
    logger.error(error, `There was an error in the BusinessQueue`)
  })

  return queue
}

/**
 * Initialize QueueEvents
 */
export function initQueueEvents(
  connection: ConnectionOptions,
  logger: Logger
): QueueEvents {
  const queueEvents = new QueueEvents(BUSINESS_QUEUE_NAME, {
    connection,
    autorun: false
  })

  queueEvents.on('error', (error) => {
    logger.error(error, `There was an error in the BusinessQueue`)
  })

  return queueEvents
}

/**
 * Add Jobs
 */
export async function addJobs(
  queue: BusinessQueue,
  name: string,
  ids: number[],
  heartbeatJob: HeartbeatJob,
  logger: Logger,
): Promise<BusinessJob[]> {
  if (heartbeatJob.id === undefined) {
    throw new Error(`HeartbeatJob lost id`)
  }

  const opts: BulkJobOptions = {
    parent: {
      id: heartbeatJob.id,
      queue: heartbeatJob.queueQualifiedName
    }
  }

  const jobs = await queue.addBulk(
    ids.map((id) => ({
      name,
      data: { id },
      opts
    }))
  )

  jobs.forEach((job) => {
    // FIXME
    logger.debug(`BusinessJob added`)
  })

  return jobs
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
export function getWorkerLimiter<T extends BusinessConfig>(
  config: T
): RateLimiterOptions {
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
  const worker = new Worker<BusinessData, BusinessResult>(
    BUSINESS_QUEUE_NAME,
    processor,
    {
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
    }
  )

  worker.on('error', (error) => {
    logger.error(error, `There was an error in the BusinessWorker`)
  })

  return worker
}
