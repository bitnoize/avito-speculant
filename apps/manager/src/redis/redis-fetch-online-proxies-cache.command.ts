import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { redisService, proxyCacheService } from '@avito-speculant/redis'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'redis-fetch-online-proxies-cache',
    description: 'Redis fetch online proxies cache',
    args: {},
    handler: async () => {
      const redisOptions = redisService.getRedisOptions<Config>(config)
      const redis = redisService.initRedis(redisOptions, logger)

      const { proxiesCache } = await proxyCacheService.fetchOnlineProxiesCache(redis, undefined)

      logger.info({ proxiesCache }, `ProxiesCache successfully fetched`)

      await redisService.closeRedis(redis)
    }
  })
}
