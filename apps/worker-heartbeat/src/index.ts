import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import {
  HeartbeatJob,
  HeartbeatResult,
  queueService,
  heartbeatService
} from '@avito-speculant/queue'
import { Config } from './worker-heartbeat.js'
import { configSchema } from './worker-heartbeat.schema.js'
import { heartbeatProcessor } from './worker-heartbeat.processor.js'

async function bootstrap(): Promise<void> {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const queueConnection = queueService.getQueueConnection<Config>(config)
  const concurrency = heartbeatService.getWorkerConcurrency<Config>(config)
  const limiter = heartbeatService.getWorkerLimiter<Config>(config)

  const heartbeatWorker = heartbeatService.initWorker(
    heartbeatProcessor,
    queueConnection,
    concurrency,
    limiter,
    logger
  )

  heartbeatWorker.on('completed', (job: HeartbeatJob, result: HeartbeatResult) => {
    logger.info(result, `HeartbeatJob completed`)
  })

  heartbeatWorker.on('failed', (job: HeartbeatJob | undefined, error: Error) => {
    logger.info(error, `HeartbeatJob failed`)
  })

  await heartbeatService.startWorker(heartbeatWorker, logger)
}

bootstrap().catch((error) => {
  console.error(error)
  process.exit(1)
})
