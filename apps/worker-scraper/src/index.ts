import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { ScraperJob, ScraperResult, queueService, scraperService } from '@avito-speculant/queue'
import { Config } from './worker-scraper.js'
import { configSchema } from './worker-scraper.schema.js'
import { scraperProcessor } from './worker-scraper.processor.js'

async function bootstrap(): Promise<void> {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const queueConnection = queueService.getQueueConnection<Config>(config)
  const concurrency = scraperService.getWorkerConcurrency<Config>(config)
  const limiter = scraperService.getWorkerLimiter<Config>(config)

  const scraperWorker = scraperService.initWorker(
    scraperProcessor,
    queueConnection,
    concurrency,
    limiter,
    logger
  )

  scraperWorker.on('completed', (job: ScraperJob, result: ScraperResult) => {
    logger.info(result, `ScraperJob completed`)
  })

  scraperWorker.on('failed', (job: ScraperJob, error: Error) => {
    logger.info(error, `ScraperJob failed`)
  })

  await scraperService.startWorker(scraperWorker, logger)
}

bootstrap().catch((error) => {
  console.error(error)
  process.exit(1)
})
