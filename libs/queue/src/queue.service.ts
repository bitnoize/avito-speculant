import {
  ConnectionOptions,
  RateLimiterOptions,
  Queue,
  FlowProducer,
  QueueEvents,
  Worker,
  Processor,
  MetricsTime
} from 'bullmq'
import { Logger } from '@avito-speculant/logger'
import { DomainError } from '@avito-speculant/common'
import { QueueConfig } from './queue.js'

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
 * Initialize BaseQueue
 */
export function initBaseQueue<DT, RT, NT extends string>(
  name: string,
  connection: ConnectionOptions,
  logger: Logger
): Queue<DT, RT, NT> {
  const queue = new Queue<DT, RT, NT>(name, {
    connection
  })

  const logQueueName = toLogQueueName(name)

  queue.on('error', (error) => {
    logger.fatal(`${logQueueName} enter error state`)
    logger.fatal(error.stack ?? error.message)
  })

  queue.on('ioredis:close', () => {
    logger.debug(`${logQueueName} enter ioredis:close state`)
  })

  queue.on('paused', () => {
    logger.debug(`${logQueueName} enter paused state`)
  })

  queue.on('resumed', () => {
    logger.debug(`${logQueueName} enter resumed state`)
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
    logger.debug(logData, `${logQueueName} enter waiting state`)
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
    logger.debug(logData, `${logQueueName} enter progress state`)
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
    logger.debug(logData, `${logQueueName} enter removed state`)
  })

  queue.on('cleaned', (jobs, type) => {
    const logData = { jobs, type }
    logger.debug(logData, `${logQueueName} enter cleaned state`)
  })

  return queue
}

/**
 * Initialize FlowProducer
 */
export function initFlowProducer(connection: ConnectionOptions, logger: Logger): FlowProducer {
  const flowProducer = new FlowProducer({
    connection
  })

  flowProducer.on('error', (error) => {
    logger.fatal(`FlowProducer enter error state`)
    logger.fatal(error.stack ?? error.message)
  })

  flowProducer.on('ioredis:close', () => {
    logger.debug(`FlowProducer enter ioredis:close state`)
  })

  return flowProducer
}

/**
 * Close FlowProducer
 */
export async function closeFlowProducer(flowProducer: FlowProducer): Promise<void> {
  await flowProducer.close()
}

/**
 * Initialize QueueEvents
 */
export function initQueueEvents(
  name: string,
  connection: ConnectionOptions,
  logger: Logger
): QueueEvents {
  const queueEvents = new QueueEvents(name, {
    connection,
    autorun: false
  })

  const logQueueName = toLogQueueName(name)

  queueEvents.on('error', (error) => {
    logger.fatal(`${logQueueName} enter error state`)
    logger.fatal(error.message)
  })

  queueEvents.on('ioredis:close', () => {
    logger.debug(`${logQueueName} enter ioredis:close state`)
  })

  queueEvents.on('paused', (args, id) => {
    const logData = { args, id }
    logger.debug(logData, `${logQueueName} enter paused state`)
  })

  queueEvents.on('resumed', (args, id) => {
    const logData = { args, id }
    logger.debug(logData, `${logQueueName} enter resumed state`)
  })

  queueEvents.on('added', (args, id) => {
    const logData = { args, id }
    logger.debug(logData, `${logQueueName} enter added state`)
  })

  queueEvents.on('duplicated', (args, id) => {
    const logData = { args, id }
    logger.debug(logData, `${logQueueName} enter duplicated state`)
  })

  queueEvents.on('delayed', (args, id) => {
    const logData = { args, id }
    logger.debug(logData, `${logQueueName} enter delayed state`)
  })

  queueEvents.on('waiting', (args, id) => {
    const logData = { args, id }
    logger.debug(logData, `${logQueueName} enter waiting state`)
  })

  queueEvents.on('active', (args, id) => {
    const logData = { args, id }
    logger.debug(logData, `${logQueueName} enter active state`)
  })

  queueEvents.on('completed', (args, id) => {
    const logData = { args, id }
    logger.info(logData, `${logQueueName} enter completed state`)
  })

  queueEvents.on('progress', (args, id) => {
    const logData = { args, id }
    logger.debug(logData, `${logQueueName} enter progress state`)
  })

  queueEvents.on('failed', (args, id) => {
    const logData = { args, id }
    logger.error(logData, `${logQueueName} enter failed state`)
  })

  queueEvents.on('stalled', (args, id) => {
    const logData = { args, id }
    logger.error(logData, `${logQueueName} enter stalled state`)
  })

  queueEvents.on('removed', (args, id) => {
    const logData = { args, id }
    logger.debug(logData, `${logQueueName} enter removed state`)
  })

  queueEvents.on('cleaned', (args, id) => {
    const logData = { args, id }
    logger.debug(logData, `${logQueueName} enter cleaned state`)
  })

  queueEvents.on('drained', (id) => {
    const logData = { id }
    logger.debug(logData, `${logQueueName} enter drained state`)
  })

  return queueEvents
}

/**
 * Run QueueEvents
 */
export async function runQueueEvents(queueEvents: QueueEvents): Promise<void> {
  await queueEvents.run()
}

/**
 * Close QueueEvents
 */
export async function closeQueueEvents(queueEvents: QueueEvents): Promise<void> {
  await queueEvents.close()
}

/**
 * Initialize BaseWorker
 */
export function initBaseWorker<DT, RT, NT extends string>(
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

  const logWorkerName = toLogWorkerName(name)

  worker.on('error', (error) => {
    logger.fatal(`${logWorkerName} enter error state`)
    logger.fatal(error.stack ?? error.message)
  })

  worker.on('ready', () => {
    logger.debug(`${logWorkerName} enter ready state`)
  })

  worker.on('closing', () => {
    logger.debug(`${logWorkerName} enter closing state`)
  })

  worker.on('closed', () => {
    logger.debug(`${logWorkerName} enter closed state`)
  })

  worker.on('ioredis:close', () => {
    logger.debug(`${logWorkerName} enter ioredis:close state`)
  })

  worker.on('paused', () => {
    logger.debug(`${logWorkerName} enter paused state`)
  })

  worker.on('resumed', () => {
    logger.debug(`${logWorkerName} enter resumed state`)
  })

  worker.on('drained', () => {
    logger.debug(`${logWorkerName} enter drained state`)
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
    logger.debug(logData, `${logWorkerName} enter active state`)
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
    logger.debug(logData, `${logWorkerName} enter progress state`)
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
    logger.info(logData, `${logWorkerName} enter completed state`)
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
      logger.error(logData, `${logWorkerName} enter failed state`)
    } else {
      const logData = { prev }
      logger.error(logData, `${logWorkerName} stalled job reaches limit`)
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
    logger.error(logData, `${logWorkerName} enter stalled state`)
  })

  return worker
}

const toLogQueueName = (name: string): string => toLogName(name, 'Queue')
const toLogWorkerName = (name: string): string => toLogName(name, 'Worker')

const toLogName = (name: string, suffix: string): string =>
  name[0].toUpperCase() + name.slice(1).toLowerCase() + suffix
