import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { redisService, proxyCacheService } from '@avito-speculant/redis'
import { Config, InitCommand } from '../manager.js'

const initCommand: InitCommand = (config, logger) => {
  return command({
    name: 'redis-proxies-cache-fetch',
    description: 'fetch proxies cache',
    args: {},
    handler: async () => {
      const redisOptions = redisService.getRedisOptions<Config>(config)
      const redis = redisService.initRedis(redisOptions, logger)

      try {
        const { proxiesCache } = await proxyCacheService.fetchProxiesCache(redis)

        logger.info({ proxiesCache }, `ProxiesCache fetched`)
      } finally {
        await redisService.closeRedis(redis)
      }
    }
  })
}

export default initCommand
