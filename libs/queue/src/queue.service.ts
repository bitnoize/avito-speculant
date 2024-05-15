import {
  ConnectionOptions,
  RateLimiterOptions,
  Queue,
  Worker,
  Processor,
  MetricsTime
} from 'bullmq'
import { Logger } from '@avito-speculant/logger'
import { DomainError } from '@avito-speculant/common'
import { QueueConfig, QueueSummary } from './queue.js'

/**
 * Get QueueConnection from config
 */
export function getQueueConnection<T extends QueueConfig>(config: T): ConnectionOptions {
  const connection: ConnectionOptions = {
    host: config.QUEUE_REDIS_HOST,
    port: config.QUEUE_REDIS_PORT,
    db: config.QUEUE_REDIS_DATABASE,
    username: config.QUEUE_REDIS_USERNAME,
    password: config.QUEUE_REDIS_PASSWORD
  }

  return connection
}

/*
 * Initialize QueueBase
 */
export function initQueueBase<DT, RT, NT extends string>(
  name: string,
  connection: ConnectionOptions,
  logger: Logger
): Queue<DT, RT, NT> {
  const queue = new Queue<DT, RT, NT>(name, {
    connection
  })

  queue.on('error', (error) => {
    logger.fatal(`Queue '${name}' enter error state`)
    logger.fatal(error.stack ?? error.message)
  })

  queue.on('ioredis:close', () => {
    logger.debug(`Queue '${name}' enter ioredis:close state`)
  })

  queue.on('paused', () => {
    logger.debug(`Queue '${name}' enter paused state`)
  })

  queue.on('resumed', () => {
    logger.debug(`Queue '${name}' enter resumed state`)
  })

  queue.on('waiting', (job) => {
    const logData = {
      queue: job.queueName,
      job: {
        id: job.id,
        name: job.name,
        data: job.data
      }
    }
    logger.debug(logData, `Queue '${name}' enter waiting state`)
  })

  queue.on('progress', (job, progress) => {
    const logData = {
      queue: job.queueName,
      job: {
        id: job.id,
        name: job.name,
        data: job.data
      },
      progress
    }
    logger.debug(logData, `Queue '${name}' enter progress state`)
  })

  queue.on('removed', (job) => {
    const logData = {
      queue: job.queueName,
      job: {
        id: job.id,
        name: job.name,
        data: job.data
      }
    }
    logger.debug(logData, `Queue '${name}' enter removed state`)
  })

  queue.on('cleaned', (jobs, type) => {
    const logData = { jobs, type }
    logger.debug(logData, `Queue '${name}' enter cleaned state`)
  })

  return queue
}

/**
 * Close QueueBase
 */
export async function closeQueueBase<DT, RT, NT extends string>(
  queue: Queue<DT, RT, NT>
): Promise<void> {
  await queue.close()
}

/**
 * Initialize WorkerBase
 */
export function initWorkerBase<DT, RT, NT extends string>(
  name: string,
  processor: Processor<DT, RT, NT>,
  connection: ConnectionOptions,
  concurrency: number,
  limiter: RateLimiterOptions,
  logger: Logger
): Worker<DT, RT, NT> {
  const worker = new Worker<DT, RT, NT>(name, processor, {
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
    logger.fatal(`Worker '${name}' enter error state`)
    logger.fatal(error.stack ?? error.message)
  })

  worker.on('ready', () => {
    logger.debug(`Worker '${name}' enter ready state`)
  })

  worker.on('closing', () => {
    logger.debug(`Worker '${name}' enter closing state`)
  })

  worker.on('closed', () => {
    logger.debug(`Worker '${name}' enter closed state`)
  })

  worker.on('ioredis:close', () => {
    logger.debug(`Worker '${name}' enter ioredis:close state`)
  })

  worker.on('paused', () => {
    logger.debug(`Worker '${name}' enter paused state`)
  })

  worker.on('resumed', () => {
    logger.debug(`Worker '${name}' enter resumed state`)
  })

  worker.on('drained', () => {
    logger.debug(`Worker '${name}' enter drained state`)
  })

  worker.on('active', (job, prev) => {
    const logData = {
      queue: job.queueName,
      job: {
        id: job.id,
        name: job.name,
        data: job.data
      },
      prev
    }
    logger.debug(logData, `Worker '${name}' enter active state`)
  })

  worker.on('progress', (job, progress) => {
    const logData = {
      queue: job.queueName,
      job: {
        id: job.id,
        name: job.name,
        data: job.data
      },
      progress
    }
    logger.debug(logData, `Worker '${name}' enter progress state`)
  })

  worker.on('completed', (job, result, prev) => {
    const logData = {
      queue: job.queueName,
      job: {
        id: job.id,
        name: job.name,
        data: job.data
      },
      result,
      prev
    }
    logger.info(logData, `Worker '${name}' enter completed state`)
  })

  worker.on('failed', (job, error, prev) => {
    if (job !== undefined) {
      const logData = {
        queue: job.queueName,
        job: {
          id: job.id,
          name: job.name,
          data: job.data
        },
        prev
      }
      logger.error(logData, `Worker '${name}' enter failed state`)
    } else {
      const logData = { prev }
      logger.error(logData, `Worker '${name}' stalled job reaches limit`)
    }

    if (error instanceof DomainError) {
      const logData = {
        context: error.context,
        code: error.code
      }
      logger.error(logData, error.stack ?? error.message)
    } else {
      logger.error(error.stack ?? error.message)
    }
  })

  worker.on('stalled', (jobId, prev) => {
    const logData = { jobId, prev }
    logger.warn(logData, `Worker '${name}' enter stalled state`)
  })

  return worker
}

/**
 * Run WorkerBase
 */
export async function runWorkerBase<DT, RT, NT extends string>(
  worker: Worker<DT, RT, NT>,
  logger: Logger
): Promise<void> {
  const gracefulShutdown = async (signal: string): Promise<void> => {
    logger.warn(`Worker '${worker.name}' received ${signal}`)

    await worker.close()
    process.exit(0)
  }

  process.on('SIGINT', () => gracefulShutdown('SIGINT'))
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))

  await worker.run()
}

/**
 * Get QueueSummaryBase
 */
export async function getQueueSummaryBase<DT, RT, NT extends string>(
  queue: Queue<DT, RT, NT>
): Promise<QueueSummary> {
  const isPaused = await queue.isPaused()
  const jobCounts = await queue.getJobCounts(
    'delayed',
    'waiting',
    'waiting-children',
    'active',
    'completed',
    'failed'
  )
  const workersCount = await queue.getWorkersCount()

  return {
    isPaused,
    jobCounts,
    workersCount
  }
}
