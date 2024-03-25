import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { queueService, scrapingService } from '@avito-speculant/queue'
import { Config } from './worker-scraping.js'
import { configSchema } from './worker-scraping.schema.js'
import scrapingProcessor from './worker-scraping.processor.js'

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

  await scrapingService.runWorker(scrapingWorker)
}

bootstrap().catch((error) => {
  console.error(error)
  process.exit(1)
})
