import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { DomainError } from '@avito-speculant/common'
import { redisService, proxyCacheService } from '@avito-speculant/redis'
import {
  ProcessorUnknownNameError,
  ProxycheckResult,
  ProxycheckProcessor
} from '@avito-speculant/queue'
import { Config, NameProcess } from './worker-proxycheck.js'
import { configSchema } from './worker-proxycheck.schema.js'
import { curlRequest } from '././worker-proxycheck.utils.js'

export const proxycheckProcessor: ProxycheckProcessor = async (proxycheckJob) => {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)

  const result: ProxycheckResult = {}

  try {
    const name = proxycheckJob.name

    switch (name) {
      case 'simple': {
        result[name] = await processSimple(config, logger, redis, proxycheckJob)

        break
      }

      default: {
        throw new ProcessorUnknownNameError({ name })
      }
    }
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

  return result
}

const processSimple: NameProcess = async (config, logger, redis, proxycheckJob) => {
  try {
    const { proxyCache } = await proxyCacheService.fetchProxyCache(redis, {
      proxyId: proxycheckJob.data.proxyId
    })

    const curlResponse = await curlRequest(
      config.PROXYCHECK_CHECK_URL,
      proxyCache.proxyUrl,
      config.PROXYCHECK_CHECK_TIMEOUT,
      false
    )

    if (curlResponse.error !== undefined) {
      await proxyCacheService.renewOfflineProxyCache(redis, {
        proxyId: proxyCache.id,
        sizeBytes: 0
      })

      const logData = {
        proxyCache,
        error: curlResponse.error
      }
      logger.warn(logData, `ProxycheckProcessor processSimple curlRequest failed`)

      return {
        proxyId: proxyCache.id,
        success: false,
        statusCode: 0,
        sizeBytes: 0
      }
    }

    if (curlResponse.statusCode !== 200) {
      await proxyCacheService.renewOfflineProxyCache(redis, {
        proxyId: proxyCache.id,
        sizeBytes: curlResponse.body.length
      })

      return {
        proxyId: proxyCache.id,
        success: false,
        statusCode: curlResponse.statusCode,
        sizeBytes: curlResponse.body.length
      }
    }

    await proxyCacheService.renewOnlineProxyCache(redis, {
      proxyId: proxyCache.id,
      sizeBytes: curlResponse.body.length
    })

    return {
      proxyId: proxyCache.id,
      success: true,
      statusCode: curlResponse.statusCode,
      sizeBytes: curlResponse.body.length
    }
  } catch (error) {
    if (error instanceof DomainError) {
      logger.error(`ProxycheckProcessor processSimple exception`)

      error.setEmergency()
    }

    throw error
  }
}
