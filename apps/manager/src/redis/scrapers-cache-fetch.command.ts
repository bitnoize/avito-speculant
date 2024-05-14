import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { redisService, scraperCacheService } from '@avito-speculant/redis'
import { Config, InitCommand } from '../manager.js'

const initCommand: InitCommand = (config, logger) => {
  return command({
    name: 'redis-scrapers-cache-fetch',
    description: 'fetch scrapers cache',
    args: {},
    handler: async () => {
      const redisOptions = redisService.getRedisOptions<Config>(config)
      const redis = redisService.initRedis(redisOptions, logger)

      try {
        const { scrapersCache } = await scraperCacheService.fetchScrapersCache(redis)

        logger.info({ scrapersCache }, `ScrapersCache fetched`)
      } finally {
        await redisService.closeRedis(redis)
      }
    }
  })
}

export default initCommand
