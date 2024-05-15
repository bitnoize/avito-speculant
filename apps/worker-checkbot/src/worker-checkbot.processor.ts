import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { redisService, botCacheService, proxyCacheService } from '@avito-speculant/redis'
import {
  CHECKBOT_PLACEHOLDER_URL,
  CheckbotResult,
  CheckbotProcessor
} from '@avito-speculant/queue'
import { Config, ProcessName } from './worker-checkbot.js'
import { configSchema } from './worker-checkbot.schema.js'
import { testRequest } from './worker-checkbot.utils.js'

export const checkbotProcessor: CheckbotProcessor = async function (checkbotJob) {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const checkbotResult: CheckbotResult = {
    success: false,
    testingTime: 0,
    durationTime: 0,
  }

  await processDefault(config, logger, checkbotJob, checkbotResult)

  return checkbotResult
}

const processDefault: ProcessName = async function (
  config,
  logger,
  checkbotJob,
  checkbotResult
) {
  const startTime = Date.now()
  const { botId } = checkbotJob.data

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)

  try {
    const { botCache } = await botCacheService.fetchBotCache(redis, {
      botId
    })

    const { proxyCache } = await proxyCacheService.fetchRandomOnlineProxyCache(redis)

    const {
      tgFromId,
      username,
      testingTime,
      testError
    } = await testRequest(
      botCache.token,
      proxyCache.url,
      CHECKBOT_PLACEHOLDER_URL,
    )

    checkbotResult.testingTime = testingTime

    if (testError === undefined) {
      checkbotResult.success = true
    } else {
      logger.warn({ botCache, testError }, `checkbot test failed`)
    }

    if (checkbotResult.success) {
      await botCacheService.saveOnlineBotCache(redis, {
        botId: botCache.id,
        tgFromId,
        username,
      })
    } else {
      await botCacheService.saveOfflineBotCache(redis, {
        botId: botCache.id,
      })
    }
  } finally {
    await redisService.closeRedis(redis)

    checkbotResult.durationTime = Date.now() - startTime
  }
}
