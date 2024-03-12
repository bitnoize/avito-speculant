import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { queueService, businessService } from '@avito-speculant/queue'
import { Config } from './worker-business.js'
import { configSchema } from './worker-business.schema.js'
import businessProcessor from './worker-business.processor.js'

async function bootstrap(): Promise<void> {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const queueConnection = queueService.getQueueConnection<Config>(config)
  const concurrency = businessService.getWorkerConcurrency<Config>(config)
  const limiter = businessService.getWorkerLimiter<Config>(config)

  const businessWorker = businessService.initWorker(
    businessProcessor,
    queueConnection,
    concurrency,
    limiter,
    logger
  )

  await businessService.runWorker(businessWorker)
}

bootstrap().catch((error) => {
  console.error(error)
  process.exit(1)
})
