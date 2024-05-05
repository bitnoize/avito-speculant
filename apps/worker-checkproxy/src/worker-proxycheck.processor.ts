import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { redisService, proxyCacheService } from '@avito-speculant/redis'
import { CheckproxyResult, CheckproxyProcessor } from '@avito-speculant/queue'
import { Config, ProcessName, CurlRequestArgs } from './worker-checkproxy.js'
import { configSchema } from './worker-checkproxy.schema.js'
import { curlRequest } from './worker-checkproxy.utils.js'

export const checkproxyProcessor: CheckproxyProcessor = async function (checkproxyJob) {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const checkproxyResult: CheckproxyResult = {
    success: false,
    statusCode: 0,
    sizeBytes: 0,
    requestTime: 0,
    durationTime: 0
  }

  await processDefault(config, logger, checkproxyJob, checkproxyResult)

  return checkproxyResult
}

const processDefault: ProcessDefault = async function (
  config,
  logger,
  checkproxyJob,
  checkproxyResult
) {
  const startTime = Date.now()
  const { proxyId } = checkproxyJob.data

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)

  try {
    const { proxyCache } = await proxyCacheService.fetchProxyCache(redis, {
      proxyId
    })

    const curlRequestArgs: CurlRequestArgs = [
      config.PROXYCHECK_REQUEST_URL,
      proxyCache.proxyUrl,
      config.PROXYCHECK_REQUEST_TIMEOUT,
      config.PROXYCHECK_REQUEST_VERBOSE
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

      checkproxyResult.statusCode = curlResponse.statusCode
      checkproxyResult.sizeBytes = curlResponse.sizeBytes
      checkproxyResult.requestTime = curlResponse.requestTime
    } else if (curlResponse.statusCode !== 200) {
      await proxyCacheService.renewOfflineProxyCache(redis, {
        proxyId: proxyCache.id,
        sizeBytes: curlResponse.sizeBytes
      })

      checkproxyResult.statusCode = curlResponse.statusCode
      checkproxyResult.sizeBytes = curlResponse.sizeBytes
      checkproxyResult.requestTime = curlResponse.requestTime
    } else {
      await proxyCacheService.renewOnlineProxyCache(redis, {
        proxyId: proxyCache.id,
        sizeBytes: curlResponse.sizeBytes
      })

      checkproxyResult.success = true
      checkproxyResult.statusCode = curlResponse.statusCode
      checkproxyResult.sizeBytes = curlResponse.sizeBytes
      checkproxyResult.requestTime = curlResponse.requestTime
    }
  } finally {
    await redisService.closeRedis(redis)

    checkproxyResult.durationTime = Date.now() - startTime
  }
}
