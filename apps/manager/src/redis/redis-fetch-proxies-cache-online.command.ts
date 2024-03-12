import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { redisService, proxyCacheService } from '@avito-speculant/redis'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'database-fetch-proxies-cache-online',
    description: 'Redis fetch proxies cache online',
    args: {},
    handler: async () => {
      const redisOptions = redisService.getRedisOptions<Config>(config)
      const redis = redisService.initRedis(redisOptions, logger)

      const { proxiesCache } = await proxyCacheService.fetchProxiesCacheOnline(redis)

      logger.info({ proxiesCache }, `ProxiesCache successfully fetched`)

      await redisService.closeRedis(redis)
    }
  })
}
