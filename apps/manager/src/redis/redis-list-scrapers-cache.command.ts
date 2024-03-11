import { command, positional, flag, number, boolean } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { redisService, scraperCacheService } from '@avito-speculant/redis'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'database-list-scrapers-cache',
    description: 'Redis list scrapers cache',
    args: {},
    handler: async () => {
      const redisOptions = redisService.getRedisOptions<Config>(config)
      const redis = redisService.initRedis(redisOptions, logger)

      const listedScrapersCache = await scraperCacheService.listScrapersCache(redis)
      logger.info(listedScrapersCache)

      await redisService.closeRedis(redis)
    }
  })
}
