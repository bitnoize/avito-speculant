import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { queueService, heartbeatService } from '@avito-speculant/queue'
import { Config } from './worker-heartbeat.js'
import { configSchema } from './worker-heartbeat.schema.js'
import heartbeatProcessor from './worker-heartbeat.processor.js'

process.on('unhandledRejection', (reason, p) => {
  console.error(reason, 'Unhandled Rejection at promise', p)
})

process.on('uncaughtException', (error) => {
  console.error(error, 'Uncaught Exception thrown')
  process.exit(1)
})

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

  await heartbeatService.runWorker(heartbeatWorker, logger)
}

bootstrap().catch((error) => {
  console.error(error)
  process.exit(1)
})
