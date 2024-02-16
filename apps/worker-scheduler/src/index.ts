import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { queueService, schedulerService } from '@avito-speculant/queue'
import { Config } from './worker-scheduler.js'
import { configSchema } from './config.schema.js'
import { schedulerProcessor } from './worker-scheduler.processor.js'

async function bootstrap(): Promise<void> {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const queueConnection = queueService.getQueueConnection<Config>(config)
  const concurrency = schedulerService.getWorkerConcurrency<Config>(config)
  const limiter = schedulerService.getWorkerLimiter<Config>(config)

  const scheduler = schedulerService.initWorker(
    schedulerProcessor,
    queueConnection,
    concurrency,
    limiter,
    logger
  )

  await schedulerService.startWorker(scheduler, logger)
}

bootstrap().catch((error) => {
  console.error(error)
  process.exit(1)
})
