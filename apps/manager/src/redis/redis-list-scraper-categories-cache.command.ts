import { command, positional, string } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { redisService, categoryCacheService } from '@avito-speculant/redis'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'database-list-scraper-categories-cache',
    description: 'Redis list scraper categories cache',
    args: {
      scraperJobId: positional({
        type: string,
        displayName: 'scraperJobId'
      })
    },
    handler: async ({ scraperJobId }) => {
      const redisOptions = redisService.getRedisOptions<Config>(config)
      const redis = redisService.initRedis(redisOptions, logger)

      const listedCategoriesCache = await categoryCacheService.listScraperCategoriesCache(redis, {
        scraperJobId
      })
      logger.info(listedCategoriesCache)

      await redisService.closeRedis(redis)
    }
  })
}
