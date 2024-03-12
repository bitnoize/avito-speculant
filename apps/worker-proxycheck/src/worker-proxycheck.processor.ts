import got, { Agents } from 'got'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { redisService, proxyCacheService } from '@avito-speculant/redis'
import { ProxycheckProcessor } from '@avito-speculant/queue'
import { Config } from './worker-proxycheck.js'
import { configSchema } from './worker-proxycheck.schema.js'

export const proxycheckProcessor: ProxycheckProcessor = async (proxycheckJob) => {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)

  const { proxyCache } = await proxyCacheService.fetchProxyCache(redis, {
    proxyId: proxycheckJob.data.proxyId
  })

  const isOnline = await proxycheckRequest(
    proxyCache.proxyUrl,
    config.PROXYCHECK_TEST_URL,
    config.PROXYCHECK_TEST_TIMEOUT
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

  logger.info(`ProxycheckJob complete`)

  await redisService.closeRedis(redis)
}

const proxycheckRequest = async (
  proxyUrl: string,
  checkUrl: string,
  timeout: number
): Promise<boolean> => {
  try {
    const agent = new HttpsProxyAgent(proxyUrl)

    const { statusCode } = await got(checkUrl, {
      followRedirect: false,
      throwHttpErrors: false,
      timeout: {
        request: timeout
      },
      retry: {
        limit: 0
      },
      agent: agent as Agents,
    })

    return statusCode === 200 ? true : false
  } catch (error) {
    return false
  }
}
