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

  const checkproxyResult: CheckproxyResult = {}

  await processDefault(config, logger, checkproxyJob, checkproxyResult)

  return checkproxyResult
}

const processDefault: ProcessDefault = async function (
  config,
  logger,
  checkproxyJob,
  checkproxyResult
) {
  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)

  const startTime = Date.now()
  const name = checkproxyJob.name
  const { proxyId } = checkproxyJob.data

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
      logger.warn(logData, `CheckproxyProcessor processDefault curlRequest failed`)

      checkproxyResult[name] = {
        success: false,
        statusCode: curlResponse.statusCode,
        sizeBytes: curlResponse.sizeBytes,
        durationTime: Date.now() - startTime,
        curlDurationTime: curlResponse.durationTime
      }

      return
    }

    if (curlResponse.statusCode !== 200) {
      await proxyCacheService.renewOfflineProxyCache(redis, {
        proxyId: proxyCache.id,
        sizeBytes: curlResponse.sizeBytes
      })

      checkproxyResult[name] = {
        success: false,
        statusCode: curlResponse.statusCode,
        sizeBytes: curlResponse.sizeBytes,
        durationTime: Date.now() - startTime,
        curlDurationTime: curlResponse.durationTime
      }

      return
    }

    await proxyCacheService.renewOnlineProxyCache(redis, {
      proxyId: proxyCache.id,
      sizeBytes: curlResponse.sizeBytes
    })

    checkproxyResult[name] = {
      success: true,
      statusCode: curlResponse.statusCode,
      sizeBytes: curlResponse.sizeBytes,
      durationTime: Date.now() - startTime,
      curlDurationTime: curlResponse.durationTime
    }
  } finally {
    await redisService.closeRedis(redis)
  }
}
