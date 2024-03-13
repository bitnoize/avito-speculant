import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { queueService, sendreportService } from '@avito-speculant/queue'
import { Config } from './worker-sendreport.js'
import { configSchema } from './worker-sendreport.schema.js'
import sendreportProcessor from './worker-sendreport.processor.js'

async function bootstrap(): Promise<void> {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const queueConnection = queueService.getQueueConnection<Config>(config)
  const concurrency = sendreportService.getWorkerConcurrency<Config>(config)
  const limiter = sendreportService.getWorkerLimiter<Config>(config)

  const sendreportWorker = sendreportService.initWorker(
    sendreportProcessor,
    queueConnection,
    concurrency,
    limiter,
    logger
  )

  await sendreportService.runWorker(sendreportWorker)
}

bootstrap().catch((error) => {
  console.error(error)
  process.exit(1)
})
