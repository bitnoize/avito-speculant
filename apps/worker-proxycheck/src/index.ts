import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import {
  ProxycheckJob,
  ProxycheckResult,
  queueService,
  proxycheckService
} from '@avito-speculant/queue'
import { Config } from './worker-proxycheck.js'
import { configSchema } from './worker-scraper.schema.js'
import { proxycheckProcessor } from './worker-proxycheck.processor.js'

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

  proxycheckWorker.on('completed', (job: ProxycheckJob, result: ProxycheckResult) => {
    logger.info(result, `ProxycheckJob completed`)
  })

  proxycheckWorker.on('failed', (job: ProxycheckJob, error: Error) => {
    logger.info(error, `ProxycheckJob failed`)
  })

  await proxycheckService.startWorker(proxycheckWorker, logger)
}

bootstrap().catch((error) => {
  console.error(error)
  process.exit(1)
})
