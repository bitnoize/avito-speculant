import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { queueService, scrapingService } from '@avito-speculant/queue'
import { Config } from './worker-scraping.js'
import { configSchema } from './worker-scraping.schema.js'
import scrapingProcessor from './worker-scraping.processor.js'

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
  const concurrency = scrapingService.getWorkerConcurrency<Config>(config)
  const limiter = scrapingService.getWorkerLimiter<Config>(config)

  const scrapingWorker = scrapingService.initWorker(
    scrapingProcessor,
    queueConnection,
    concurrency,
    limiter,
    logger
  )

  await scrapingService.runWorker(scrapingWorker, logger)
}

bootstrap().catch((error) => {
  console.error(error)
  process.exit(1)
})
