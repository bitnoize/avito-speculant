import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { queueService, checkproxyService } from '@avito-speculant/queue'
import { Config } from './worker-checkproxy.js'
import { configSchema } from './worker-checkproxy.schema.js'
import { checkproxyProcessor } from './worker-checkproxy.processor.js'

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
  const concurrency = checkproxyService.getWorkerConcurrency<Config>(config)
  const limiter = checkproxyService.getWorkerLimiter<Config>(config)

  const checkproxyWorker = checkproxyService.initWorker(
    checkproxyProcessor,
    queueConnection,
    concurrency,
    limiter,
    logger
  )

  await checkproxyService.runWorker(checkproxyWorker, logger)
}

bootstrap().catch((error) => {
  console.error(error)
  process.exit(1)
})
