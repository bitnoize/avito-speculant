import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { redisService, proxyCacheService } from '@avito-speculant/redis'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'redis-fetch-proxies-cache',
    description: 'Redis fetch proxies cache',
    args: {},
    handler: async () => {
      const redisOptions = redisService.getRedisOptions<Config>(config)
      const redis = redisService.initRedis(redisOptions, logger)

      const { proxiesCache } = await proxyCacheService.fetchProxiesCache(redis)

      logger.info({ proxiesCache }, `ProxiesCache successfully fetched`)

      await redisService.closeRedis(redis)
    }
  })
}
