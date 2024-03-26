import { CurlImpersonate } from 'node-curl-impersonate'
import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { DomainError } from '@avito-speculant/common'
import { redisService, proxyCacheService } from '@avito-speculant/redis'
import {
  ProcessorUnknownNameError,
  ProxycheckResult,
  ProxycheckProcessor
} from '@avito-speculant/queue'
import { Config, CurlImpersonateRequest, Process } from './worker-proxycheck.js'
import { configSchema } from './worker-proxycheck.schema.js'

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
      case 'curl-impersonate': {
        result[name] = await processCurlImpersonate(config, logger, redis, proxycheckJob)

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

const processCurlImpersonate: Process = async (config, logger, redis, proxycheckJob) => {
  try {
    const { proxyCache } = await proxyCacheService.fetchProxyCache(redis, {
      proxyId: proxycheckJob.data.proxyId
    })

    const curlImpersonateResponse = await curlImpersonateRequest(
      config.PROXYCHECK_CHECK_URL,
      proxyCache.proxyUrl,
      config.PROXYCHECK_CHECK_TIMEOUT,
      false
    )

    if (curlImpersonateResponse !== undefined) {
      if (curlImpersonateResponse.statusCode === 200) {
        await proxyCacheService.renewProxyCacheOnline(redis, {
          proxyId: proxyCache.id,
          sizeBytes: curlImpersonateResponse.sizeBytes
        })

        return {
          proxyId: proxyCache.id,
          success: true,
          statusCode: curlImpersonateResponse.statusCode,
          sizeBytes: curlImpersonateResponse.sizeBytes
        }
      } else {
        await proxyCacheService.renewProxyCacheOffline(redis, {
          proxyId: proxyCache.id,
          sizeBytes: curlImpersonateResponse.sizeBytes
        })

        return {
          proxyId: proxyCache.id,
          success: false,
          statusCode: curlImpersonateResponse.statusCode,
          sizeBytes: curlImpersonateResponse.sizeBytes
        }
      }
    } else {
      await proxyCacheService.renewProxyCacheOffline(redis, {
        proxyId: proxyCache.id,
        sizeBytes: 0
      })

      // ...

      return {
        proxyId: proxyCache.id,
        success: false,
        statusCode: 0,
        sizeBytes: 0
      }
    }
  } catch (error) {
    if (error instanceof DomainError) {
      logger.error(`ProxycheckProcessor processCurlImpersonate exception`)

      error.setEmergency()
    }

    throw error
  }
}

const curlImpersonateRequest: CurlImpersonateRequest = async (
  checkUrl,
  proxyUrl,
  timeout,
  verbose
) => {
  try {
    const curlImpersonate = new CurlImpersonate(checkUrl, {
      method: 'GET',
      impersonate: 'firefox-117',
      headers: [],
      verbose,
      followRedirects: false,
      flags: [
        `--insecure`,
        `--max-time ${timeout / 1000}`,
        `--proxy ${proxyUrl}`
      ]
    })

    const { statusCode, response } = await curlImpersonate.makeRequest()

    return {
      statusCode: statusCode ?? 0,
      body: response,
      sizeBytes: Buffer.byteLength(response)
    }
  } catch (error) {
    return undefined
  }
}
