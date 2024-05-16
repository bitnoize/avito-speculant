import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { redisService, proxyCacheService } from '@avito-speculant/redis'
import {
  CHECKPROXY_TEST_URL,
  CHECKPROXY_TEST_TIMEOUT,
  CheckproxyResult,
  CheckproxyProcessor
} from '@avito-speculant/queue'
import { Config, ProcessName } from './worker-checkproxy.js'
import { configSchema } from './worker-checkproxy.schema.js'
import { testRequest } from './worker-checkproxy.utils.js'

export const checkproxyProcessor: CheckproxyProcessor = async function (checkproxyJob) {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const checkproxyResult: CheckproxyResult = {
    success: false,
    statusCode: 0,
    testingTime: 0,
    durationTime: 0
  }

  await processDefault(config, logger, checkproxyJob, checkproxyResult)

  return checkproxyResult
}

const processDefault: ProcessName = async function (
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

    const { statusCode, testingTime, testError } = await testRequest(
      CHECKPROXY_TEST_URL,
      proxyCache.url,
      CHECKPROXY_TEST_TIMEOUT
    )

    checkproxyResult.statusCode = statusCode
    checkproxyResult.testingTime = testingTime

    if (testError === undefined && statusCode === 200) {
      checkproxyResult.success = true
    } else {
      logger.warn({ proxyCache, statusCode, testError }, `checkproxy test failed`)
    }

    if (checkproxyResult.success) {
      await proxyCacheService.saveOnlineProxyCache(redis, {
        proxyId: proxyCache.id,
        createdAt: proxyCache.createdAt
      })
    } else {
      await proxyCacheService.saveOfflineProxyCache(redis, {
        proxyId: proxyCache.id
      })
    }
  } finally {
    await redisService.closeRedis(redis)

    checkproxyResult.durationTime = Date.now() - startTime
  }
}
