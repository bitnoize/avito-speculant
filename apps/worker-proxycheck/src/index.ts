import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { queueService, proxycheckService } from '@avito-speculant/queue'
import { Config } from './worker-proxycheck.js'
import { configSchema } from './worker-proxycheck.schema.js'
import { proxycheckProcessor } from './worker-proxycheck.processor.js'

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
  const concurrency = proxycheckService.getWorkerConcurrency<Config>(config)
  const limiter = proxycheckService.getWorkerLimiter<Config>(config)

  const proxycheckWorker = proxycheckService.initWorker(
    proxycheckProcessor,
    queueConnection,
    concurrency,
    limiter,
    logger
  )

  await proxycheckService.runWorker(proxycheckWorker, logger)
}

bootstrap().catch((error) => {
  console.error(error)
  process.exit(1)
})
