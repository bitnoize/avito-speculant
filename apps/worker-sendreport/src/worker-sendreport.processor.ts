import { Bot, GrammyError, HttpError } from 'grammy'
import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { DomainError } from '@avito-speculant/common'
import {
  redisService,
  userCacheService,
  categoryCacheService,
  advertCacheService,
} from '@avito-speculant/redis'
import {
  SendreportResult,
  SendreportProcessor
} from '@avito-speculant/queue'
import { Config, ProcessDefault } from './worker-sendreport.js'
import { configSchema } from './worker-sendreport.schema.js'

const sendreportProcessor: SendreportProcessor = async (sendreportJob) => {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)

  const sendreportResult: SendreportResult = {}

  try {
    const bot = new Bot(config.BOT_TOKEN)

    await processDefault(config, logger, redis, sendreportJob, sendreportResult, bot)
  } catch (error) {
    if (error instanceof DomainError) {
      if (error.isEmergency()) {
        // ...

        logger.fatal(`SendreportWorker emergency shutdown`)
      }
    }

    throw error
  }

  return sendreportResult
}

const processDefault: ProcessDefault = async function(
  config,
  logger,
  redis,
  sendreportJob,
  sendreportResult,
  bot
) {
  try {
    const startTime = Date.now()
    const name = sendreportJob.name
    const { categoryId, advertId } = sendreportJob.data

    const { categoryCache } = await categoryCacheService.fetchCategoryCache(redis, {
      categoryId
    })

    const { userCache } = await userCacheService.fetchUserCache(redis, {
      userId: categoryCache.userId
    })

    const { advertCache } = await advertCacheService.fetchAdvertCache(redis, {
      advertId
    })

    await bot.api.sendMessage(
      userCache.tgFromId,
      `Id: ${advertCache.id}\nTitle: ${advertCache.title}`
    )

    await advertCacheService.pourCategoryAdvertDone(redis, {
      categoryId: categoryCache.id,
      advertId: advertCache.id
    })

    sendreportResult[name] = {
      durationTime: Date.now() - startTime
    }
  } catch (error) {
    if (error instanceof DomainError) {
      logger.error(`SendreportProcessor processDefault exception`)

      error.setEmergency()
    }

    throw error
  }
}

export default sendreportProcessor
