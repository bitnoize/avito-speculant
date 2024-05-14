import { command, positional, string } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { redisService, categoryCacheService } from '@avito-speculant/redis'
import { Config, InitCommand } from '../manager.js'

const initCommand: InitCommand = (config, logger) => {
  return command({
    name: 'redis-scraper-categories-cache-fetch',
    description: 'fetch scraper categories cache',
    args: {
      scraperId: positional({
        type: string,
        displayName: 'scraperId',
        description: 'scraper identifier'
      })
    },
    handler: async ({ scraperId }) => {
      const redisOptions = redisService.getRedisOptions<Config>(config)
      const redis = redisService.initRedis(redisOptions, logger)

      try {
        const { categoriesCache } = await categoryCacheService.fetchScraperCategoriesCache(redis, {
          scraperId
        })

        logger.info({ categoriesCache }, `CategoriesCache successfully fetched`)
      } finally {
        await redisService.closeRedis(redis)
      }
    }
  })
}

export default initCommand
