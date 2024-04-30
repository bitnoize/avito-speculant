import { command, positional, string } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { redisService, advertCacheService } from '@avito-speculant/redis'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'redis-fetch-scraper-adverts-cache',
    description: 'Redis fetch scraper adverts cache',
    args: {
      scraperId: positional({
        type: string,
        displayName: 'scraperId'
      })
    },
    handler: async ({ scraperId }) => {
      const redisOptions = redisService.getRedisOptions<Config>(config)
      const redis = redisService.initRedis(redisOptions, logger)

      const { advertsCache } = await advertCacheService.fetchScraperAdvertsCache(redis, {
        scraperId
      })

      logger.info({ advertsCache }, `AdvertsCache successfully fetched`)

      await redisService.closeRedis(redis)
    }
  })
}
