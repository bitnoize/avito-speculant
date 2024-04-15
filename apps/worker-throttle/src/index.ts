import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { queueService, throttleService } from '@avito-speculant/queue'
import { Config } from './worker-throttle.js'
import { configSchema } from './worker-throttle.schema.js'
import throttleProcessor from './worker-throttle.processor.js'

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
  const concurrency = throttleService.getWorkerConcurrency<Config>(config)
  const limiter = throttleService.getWorkerLimiter<Config>(config)

  const throttleWorker = throttleService.initWorker(
    throttleProcessor,
    queueConnection,
    concurrency,
    limiter,
    logger
  )

  await throttleService.runWorker(throttleWorker, logger)
}

bootstrap().catch((error) => {
  console.error(error)
  process.exit(1)
})
