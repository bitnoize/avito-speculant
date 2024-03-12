import { command, positional, string } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { redisService, categoryCacheService } from '@avito-speculant/redis'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'database-fetch-scraper-categories-cache',
    description: 'Redis fetch scraper categories cache',
    args: {
      scraperJobId: positional({
        type: string,
        displayName: 'scraperJobId'
      })
    },
    handler: async ({ scraperJobId }) => {
      const redisOptions = redisService.getRedisOptions<Config>(config)
      const redis = redisService.initRedis(redisOptions, logger)

      const { categoriesCache } = await categoryCacheService.fetchScraperCategoriesCache(redis, {
        scraperJobId
      })

      logger.info({ categoriesCache, scraperJobId }, `CategoriesCache successfully fetched`)

      await redisService.closeRedis(redis)
    }
  })
}
