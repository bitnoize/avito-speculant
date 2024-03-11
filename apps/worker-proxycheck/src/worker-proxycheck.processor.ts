import got, { Agents } from 'got'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { databaseService, proxyService } from '@avito-speculant/database'
import { redisService } from '@avito-speculant/redis'
import { ProxycheckProcessor } from '@avito-speculant/queue'
import { Config } from './worker-proxycheck.js'
import { configSchema } from './worker-proxycheck.schema.js'

const doRequest = async (
  proxyUrl: string,
  checkUrl: string,
  timeoutRequest: number
): Promise<boolean> => {
  try {
    const agent = new HttpsProxyAgent(proxyUrl)

    const { statusCode } = await got(checkUrl, {
      followRedirect: false,
      throwHttpErrors: false,
      timeout: {
        request: timeoutRequest
      },
      retry: {
        limit: 0
      },
      agent: agent as Agents,
    })

    if (statusCode === 200) {
      return true
    }
    
    return false
  } catch (error) {
    return false
  }
}

export const proxycheckProcessor: ProxycheckProcessor = async (proxycheckJob) => {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
  const db = databaseService.initDatabase(databaseConfig, logger)

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)
  const pubSub = redisService.initPubSub(redisOptions, logger)

  const { proxyId, proxyUrl } = proxycheckJob.data

  let result = await doRequest(proxyUrl, 'https://www.avito.ru', 10_000)

  if (result) {
    const onlinedProxy = await proxyService.onlineProxy(db, {
      proxyId,
      data: {
        proxycheckJobId: proxycheckJob.id
      }
    })
    logger.debug(onlinedProxy)
  } else {
    const offlinedProxy = await proxyService.offlineProxy(db, {
      proxyId,
      data: {
        proxycheckJobId: proxycheckJob.id
      }
    })
    logger.debug(offlinedProxy)
  }

  logger.info({ id: proxycheckJob.id, result }, `ProxycheckJob complete`)

  await redisService.closePubSub(pubSub)
  await redisService.closeRedis(redis)
  await databaseService.closeDatabase(db)

  return result
}
