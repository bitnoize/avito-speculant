import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { redisService, scraperCacheService } from '@avito-speculant/redis'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'redis-fetch-scrapers-cache',
    description: 'Redis fetch scrapers cache',
    args: {},
    handler: async () => {
      const redisOptions = redisService.getRedisOptions<Config>(config)
      const redis = redisService.initRedis(redisOptions, logger)

      const { scrapersCache } = await scraperCacheService.fetchScrapersCache(redis)

      logger.info({ scrapersCache }, `ScrapersCache successfully fetched`)

      await redisService.closeRedis(redis)
    }
  })
}
