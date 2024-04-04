import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { queueService, heraldingService } from '@avito-speculant/queue'
import { Config } from './worker-heralding.js'
import { configSchema } from './worker-heralding.schema.js'
import heraldingProcessor from './worker-heralding.processor.js'

async function bootstrap(): Promise<void> {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const queueConnection = queueService.getQueueConnection<Config>(config)
  const concurrency = heraldingService.getWorkerConcurrency<Config>(config)
  const limiter = heraldingService.getWorkerLimiter<Config>(config)

  const heraldingWorker = heraldingService.initWorker(
    heraldingProcessor,
    queueConnection,
    concurrency,
    limiter,
    logger
  )

  await heraldingService.runWorker(heraldingWorker)
}

bootstrap().catch((error) => {
  console.error(error)
  process.exit(1)
})
