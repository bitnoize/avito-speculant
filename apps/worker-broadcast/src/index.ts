import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { queueService, broadcastService } from '@avito-speculant/queue'
import { Config } from './worker-broadcast.js'
import { configSchema } from './worker-broadcast.schema.js'
import broadcastProcessor from './worker-broadcast.processor.js'

async function bootstrap(): Promise<void> {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const queueConnection = queueService.getQueueConnection<Config>(config)
  const concurrency = broadcastService.getWorkerConcurrency<Config>(config)
  const limiter = broadcastService.getWorkerLimiter<Config>(config)

  const broadcastWorker = broadcastService.initWorker(
    broadcastProcessor,
    queueConnection,
    concurrency,
    limiter,
    logger
  )

  await broadcastService.runWorker(broadcastWorker)
}

bootstrap().catch((error) => {
  console.error(error)
  process.exit(1)
})
