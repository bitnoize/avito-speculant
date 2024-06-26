import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import {
  redisService,
  proxyCacheService,
  scraperCacheService,
  advertCacheService
} from '@avito-speculant/redis'
import { SCRAPING_STEAL_TIMEOUT, ScrapingResult, ScrapingProcessor } from '@avito-speculant/queue'
import { Config, ProcessName } from './worker-scraping.js'
import { configSchema } from './worker-scraping.schema.js'
import { stealRequest, parseRequest } from '././worker-scraping.utils.js'

const scrapingProcessor: ScrapingProcessor = async function (scrapingJob) {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const scrapingResult: ScrapingResult = {
    success: false,
    statusCode: 0,
    stealingTime: 0,
    parsingTime: 0,
    durationTime: 0
  }

  await processDefault(config, logger, scrapingJob, scrapingResult)

  return scrapingResult
}

const processDefault: ProcessName = async function (config, logger, scrapingJob, scrapingResult) {
  const startTime = Date.now()
  const { scraperId } = scrapingJob.data

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)

  try {
    const { scraperCache } = await scraperCacheService.fetchScraperCache(redis, {
      scraperId
    })

    const { proxyCache } = await proxyCacheService.fetchRandomOnlineProxyCache(redis)

    const views = ['default', 'gallery']
    const randomView = views[Math.floor(Math.random() * views.length)]

    const avitoUrl = new URL(scraperCache.urlPath, 'https://www.avito.ru')

    avitoUrl.searchParams.set('s', '104')
    avitoUrl.searchParams.set('view', randomView)

    const { statusCode, body, stealingTime, stealError } = await stealRequest(
      avitoUrl.toString(),
      proxyCache.url,
      SCRAPING_STEAL_TIMEOUT
    )

    scrapingResult.statusCode = statusCode
    scrapingResult.stealingTime = stealingTime

    if (stealError === undefined && statusCode === 200) {
      const { scraperAdverts, parsingTime, parseError } = parseRequest(scraperCache.id, body)

      scrapingResult.parsingTime = parsingTime

      if (parseError === undefined) {
        await advertCacheService.saveAdvertsCache(redis, {
          scraperId: scraperCache.id,
          scraperAdverts
        })

        scrapingResult.success = true
      } else {
        logger.warn({ scraperCache, parseError }, `scraping parse failed`)
      }
    } else {
      logger.warn({ scraperCache, statusCode, stealError }, `scraping steal failed`)
    }

    if (scrapingResult.success) {
      await scraperCacheService.saveSuccessScraperCache(redis, {
        scraperId: scraperCache.id
      })
    } else {
      await scraperCacheService.saveFailedScraperCache(redis, {
        scraperId: scraperCache.id
      })
    }
  } finally {
    await redisService.closeRedis(redis)

    scrapingResult.durationTime = Date.now() - startTime
  }
}

export default scrapingProcessor
