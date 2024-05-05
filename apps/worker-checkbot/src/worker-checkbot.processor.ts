import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { redisService, proxyCacheService } from '@avito-speculant/redis'
import { CheckbotResult, CheckbotProcessor } from '@avito-speculant/queue'
import { Config, ProcessName, CurlRequestArgs } from './worker-checkbot.js'
import { configSchema } from './worker-checkbot.schema.js'
import { curlRequest } from './worker-checkbot.utils.js'

export const checkbotProcessor: CheckbotProcessor = async function (checkbotJob) {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const checkbotResult: CheckbotResult = {
    success: false,
    durationTime: 0
  }

  await processDefault(config, logger, checkbotJob, checkbotResult)

  return checkbotResult
}

const processDefault: ProcessDefault = async function (
  config,
  logger,
  checkbotJob,
  checkbotResult
) {
  const startTime = Date.now()
  const { proxyId } = checkbotJob.data

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)

  try {
    const { proxyCache } = await proxyCacheService.fetchProxyCache(redis, {
      proxyId
    })

    const curlRequestArgs: CurlRequestArgs = [
      config.CHECKBOT_REQUEST_URL,
      proxyCache.proxyUrl,
      config.CHECKBOT_REQUEST_TIMEOUT,
      config.CHECKBOT_REQUEST_VERBOSE
    ]

    const curlResponse = await curlRequest(...curlRequestArgs)

    if (curlResponse.error !== undefined) {
      await proxyCacheService.renewOfflineProxyCache(redis, {
        proxyId: proxyCache.id,
        sizeBytes: curlResponse.sizeBytes
      })

      const logData = {
        proxyCache,
        curlRequestArgs,
        curlResponse
      }
      logger.warn(logData, `Curl request failed`)

      checkbotResult.statusCode = curlResponse.statusCode
      checkbotResult.sizeBytes = curlResponse.sizeBytes
      checkbotResult.requestTime = curlResponse.requestTime
    } else if (curlResponse.statusCode !== 200) {
      await proxyCacheService.renewOfflineProxyCache(redis, {
        proxyId: proxyCache.id,
        sizeBytes: curlResponse.sizeBytes
      })

      checkbotResult.statusCode = curlResponse.statusCode
      checkbotResult.sizeBytes = curlResponse.sizeBytes
      checkbotResult.requestTime = curlResponse.requestTime
    } else {
      await proxyCacheService.renewOnlineProxyCache(redis, {
        proxyId: proxyCache.id,
        sizeBytes: curlResponse.sizeBytes
      })

      checkbotResult.success = true
      checkbotResult.statusCode = curlResponse.statusCode
      checkbotResult.sizeBytes = curlResponse.sizeBytes
      checkbotResult.requestTime = curlResponse.requestTime
    }
  } finally {
    await redisService.closeRedis(redis)

    checkbotResult.durationTime = Date.now() - startTime
  }
}
