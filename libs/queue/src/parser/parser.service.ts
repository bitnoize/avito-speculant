import { Logger } from '@avito-speculant/logger'
import {
  ConnectionOptions,
  RateLimiterOptions,
  Queue,
  Worker,
  MetricsTime
} from 'bullmq'
import {
  PARSER_QUEUE_NAME,
  ParserConfig,
  ParserData,
  ParserResult,
  ParserQueue,
  ParserJob,
  ParserWorker,
  ParserProcessor
} from './parser.js'

/**
 * Initialize Queue instance
 */
export function initQueue(
  connection: ConnectionOptions,
  logger: Logger
): ParserQueue {
  const queue = new Queue<ParserData, ParserResult>(PARSER_QUEUE_NAME, {
    connection
  })

  queue.on('error', (error) => {
    logger.error(error, `There was an error in the ParserQueue`)
  })

  logger.debug(`ParserQueue successfully initialized`)

  return queue
}

/**
 * Add Job
 */
export async function addRepeatableJob(
  parser: ParserQueue,
  avitoUrl: string,
  every: number
): Promise<ParserJob> {
  return await parser.add(
    `parser-${avitoUrl}`,
    {
      avitoUrl
    },
    {
      repeat: {
        every
      }
    }
  )
}

/**
 * Close Queue instance
 */
export async function closeQueue(
  queue: ParserQueue,
  logger: Logger
): Promise<void> {
  await queue.close()

  logger.debug(`ParserQueue successfully closed`)
}

/**
 * Get Worker concurrency from config
 */
export function getWorkerConcurrency<T extends ParserConfig>(config: T): number {
  return config.PARSER_CONCURRENCY
}

/**
 * Get Worker limiter from config
 */
export function getWorkerLimiter<T extends ParserConfig>(
  config: T
): RateLimiterOptions {
  return {
    max: config.PARSER_LIMITER_MAX,
    duration: config.PARSER_LIMITER_DURATION
  }
}

/**
 * Initialize Worker instance
 */
export function initWorker(
  processor: ParserProcessor,
  connection: ConnectionOptions,
  concurrency: number,
  limiter: RateLimiterOptions,
  logger: Logger
): ParserWorker {
  const worker = new Worker<ParserData, ParserResult>(
    PARSER_QUEUE_NAME,
    processor,
    {
      connection,
      concurrency,
      limiter,
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
    logger.error(error, `There was an error in the ParserWorker`)
  })

  worker.on('completed', (job: ParserJob, result: ParserResult) => {
    logger.info(result, `ParserJob complete result`)
  })

  logger.debug(`ParserWorker successfully initialized`)

  return worker
}

/**
 * Start Worker
 */
export async function startWorker(
  worker: ParserWorker,
  logger: Logger
): Promise<void> {
  await worker.run()

  logger.debug(`ParserWorker successfully started`)
}

/**
 * Close Worker instance
 */
export async function closeWorker(
  worker: ParserWorker,
  logger: Logger
): Promise<void> {
  await worker.close()

  logger.debug(`ParserWorker successfully closed`)
}
