import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { queueService, treatmentService } from '@avito-speculant/queue'
import { Config } from './worker-treatment.js'
import { configSchema } from './worker-treatment.schema.js'
import treatmentProcessor from './worker-treatment.processor.js'

async function bootstrap(): Promise<void> {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const queueConnection = queueService.getQueueConnection<Config>(config)
  const concurrency = treatmentService.getWorkerConcurrency<Config>(config)
  const limiter = treatmentService.getWorkerLimiter<Config>(config)

  const treatmentWorker = treatmentService.initWorker(
    treatmentProcessor,
    queueConnection,
    concurrency,
    limiter,
    logger
  )

  await treatmentService.runWorker(treatmentWorker)
}

bootstrap().catch((error) => {
  console.error(error)
  process.exit(1)
})
