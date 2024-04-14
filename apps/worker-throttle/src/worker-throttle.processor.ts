import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { DomainError } from '@avito-speculant/common'
import {
  redisService,
  reportCacheService
} from '@avito-speculant/redis'
import {
  ThrottleResult,
  ThrottleProcessor,
  queueService,
  sendreportService
} from '@avito-speculant/queue'
import { Config, ProcessDefault } from './worker-throttle.js'
import { configSchema } from './worker-throttle.schema.js'

const throttleProcessor: ThrottleProcessor = async (throttleJob) => {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)

  const queueConnection = queueService.getQueueConnection<Config>(config)

  const throttleResult: ThrottleResult = {}

  try {
    const sendreportQueue = sendreportService.initQueue(queueConnection, logger)

    await processDefault(
      config,
      logger,
      redis,
      throttleJob,
      throttleResult,
      sendreportQueue
    )
  } catch (error) {
    if (error instanceof DomainError) {
      if (error.isEmergency()) {
        // ...

        logger.fatal(`ThrottleWorker emergency shutdown`)
      }
    }

    throw error
  } finally {
    await redisService.closeRedis(redis)
  }

  return throttleResult
}

const processDefault: ProcessDefault = async function(
  config,
  logger,
  redis,
  throttleJob,
  throttleResult,
  sendreportQueue
) {
  try {
    const startTime = Date.now()
    const name = throttleJob.name

    const { reportsCache } = await reportCacheService.fetchReportsCache(redis, {
      limit: config.THROTTLE_REPORTS_LIMIT
    })

    for (const reportCache of reportsCache) {
      await sendreportService.addJob(sendreportQueue, reportCache.id)
    }

    throttleResult[name] = {
      durationTime: Date.now() - startTime
    }
  } catch (error) {
    if (error instanceof DomainError) {
      logger.error(`ThrottleProcessor processDefault exception`)

      error.setEmergency()
    }

    throw error
  } finally {
    await sendreportService.closeQueue(sendreportQueue)
  }
}

export default throttleProcessor
