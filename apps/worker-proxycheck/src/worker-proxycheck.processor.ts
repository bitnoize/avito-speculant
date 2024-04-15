import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { DomainError } from '@avito-speculant/common'
import { redisService, proxyCacheService } from '@avito-speculant/redis'
import { ProxycheckResult, ProxycheckProcessor } from '@avito-speculant/queue'
import { Config, ProcessDefault, CurlRequestArgs } from './worker-proxycheck.js'
import { configSchema } from './worker-proxycheck.schema.js'
import { curlRequest } from './worker-proxycheck.utils.js'

export const proxycheckProcessor: ProxycheckProcessor = async function (proxycheckJob) {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)

  const proxycheckResult: ProxycheckResult = {}

  try {
    await processDefault(config, logger, redis, proxycheckJob, proxycheckResult)
  } catch (error) {
    if (error instanceof DomainError) {
      if (error.isEmergency()) {
        // ...

        logger.fatal(`ProxycheckWorker emergency shutdown`)
      }
    }

    throw error
  } finally {
    await redisService.closeRedis(redis)
  }

  return proxycheckResult
}

const processDefault: ProcessDefault = async function (
  config,
  logger,
  redis,
  proxycheckJob,
  proxycheckResult
) {
  try {
    const startTime = Date.now()
    const name = proxycheckJob.name
    const { proxyId } = proxycheckJob.data

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
      logger.warn(logData, `ProxycheckProcessor processDefault curlRequest failed`)

      proxycheckResult[name] = {
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

      proxycheckResult[name] = {
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

    proxycheckResult[name] = {
      success: true,
      statusCode: curlResponse.statusCode,
      sizeBytes: curlResponse.sizeBytes,
      durationTime: Date.now() - startTime,
      curlDurationTime: curlResponse.durationTime
    }
  } catch (error) {
    if (error instanceof DomainError) {
      logger.error(`ProxycheckProcessor processDefault exception`)

      error.setEmergency()
    }

    throw error
  }
}
