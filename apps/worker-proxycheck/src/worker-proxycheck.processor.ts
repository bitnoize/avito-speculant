import { gotScraping } from 'got-scraping'
import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { redisService, proxyCacheService } from '@avito-speculant/redis'
import { ProxycheckProcessor } from '@avito-speculant/queue'
import {
  DEFAULT_PROXYCHECK_CHECK_URL,
  DEFAULT_PROXYCHECK_CHECK_TIMEOUT,
  Config
} from './worker-proxycheck.js'
import { configSchema } from './worker-proxycheck.schema.js'

export const proxycheckProcessor: ProxycheckProcessor = async (proxycheckJob) => {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)

  const { proxyId } = proxycheckJob.data

  const { proxyCache } = await proxyCacheService.fetchProxyCache(redis, {
    proxyId
  })

  const isOnline = await proxycheckRequest(
    proxyCache.proxyUrl,
    config.PROXYCHECK_CHECK_URL ?? DEFAULT_PROXYCHECK_CHECK_URL,
    config.PROXYCHECK_CHECK_TIMEOUT ?? DEFAULT_PROXYCHECK_CHECK_TIMEOUT
  )

  if (isOnline) {
    await proxyCacheService.renewProxyCacheOnline(redis, {
      proxyId: proxyCache.id
    })
  } else {
    await proxyCacheService.renewProxyCacheOffline(redis, {
      proxyId: proxyCache.id
    })
  }

  logger.info({ proxyId, isOnline }, `ProxycheckJob complete`)

  await redisService.closeRedis(redis)
}

const proxycheckRequest = async (
  proxyUrl: string,
  checkUrl: string,
  timeout: number
): Promise<boolean> => {
  try {
    const { statusCode } = await gotScraping.get({
      proxyUrl,
      url: checkUrl,
      followRedirect: false,
      throwHttpErrors: false,
      timeout: {
        request: timeout
      },
      retry: {
        limit: 0
      }
    })

    return statusCode === 200 ? true : false
  } catch (error) {
    return false
  }
}
