import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { queueService, checkbotService } from '@avito-speculant/queue'
import { Config } from './worker-checkbot.js'
import { configSchema } from './worker-checkbot.schema.js'
import { checkbotProcessor } from './worker-checkbot.processor.js'

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
  const concurrency = checkbotService.getWorkerConcurrency<Config>(config)
  const limiter = checkbotService.getWorkerLimiter<Config>(config)

  const checkbotWorker = checkbotService.initWorker(
    checkbotProcessor,
    queueConnection,
    concurrency,
    limiter,
    logger
  )

  await checkbotService.runWorker(checkbotWorker, logger)
}

bootstrap().catch((error) => {
  console.error(error)
  process.exit(1)
})
