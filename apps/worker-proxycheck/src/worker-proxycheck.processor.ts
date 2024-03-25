import { CurlImpersonate } from 'node-curl-impersonate'
import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { DomainError } from '@avito-speculant/common'
import { redisService, proxyCacheService } from '@avito-speculant/redis'
import {
  ProcessUnknownNameError,
  ProxycheckResult,
  ProxycheckProcessor
} from '@avito-speculant/queue'
import {
  Config,
  ProxycheckCurlImpersonateRequest,
  Process
} from './worker-proxycheck.js'
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
        throw new ProcessUnknownNameError({ name })
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

    const proxycheckCurlImpersonateResponse = await proxycheckCurlImpersonateRequest(
      config.PROXYCHECK_CHECK_URL,
      proxyCache.proxyUrl,
      config.PROXYCHECK_CHECK_TIMEOUT,
      true
    )

    if (proxycheckCurlImpersonateResponse !== undefined) {
      if (proxycheckCurlImpersonateResponse.statusCode === 200) {
        await proxyCacheService.renewProxyCacheOnline(redis, {
          proxyId: proxyCache.id
        })

        return {
          id: proxyCache.id,
          statusCode: proxycheckCurlImpersonateResponse.statusCode,
          isOnline: true,
        }
      } else {
        await proxyCacheService.renewProxyCacheOffline(redis, {
          proxyId: proxyCache.id
        })

        return {
          id: proxyCache.id,
          statusCode: proxycheckCurlImpersonateResponse.statusCode,
          isOnline: false,
        }
      }
    } else {
      await proxyCacheService.renewProxyCacheOffline(redis, {
        proxyId: proxyCache.id
      })

      return {
        id: proxyCache.id,
        isOnline: false,
        statusCode: 0
      }
    }
  } catch (error) {
    logger.error(`ProxycheckProcessor processCurlImpersonate exception`)

    throw error.setEmergency()
  }
}

const proxycheckCurlImpersonateRequest: ProxycheckCurlImpersonateRequest = async (
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
      timeout,
      verbose,
      followRedirects: false,
      flags: [
        '--insecure',
        `--proxy ${proxyUrl}`
      ]
    })

    const curlResponse = await curlImpersonate.makeRequest()

    return {
      statusCode: curlResponse.statusCode ?? 0,
      body: curlResponse.response
    }
  } catch (error) {
    return undefined
  }
}
