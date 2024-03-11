import { command, flag, boolean } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { redisService, proxyCacheService } from '@avito-speculant/redis'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'database-list-proxies-cache',
    description: 'Redis list proxies cache',
    args: {
      isOnline: flag({
        type: boolean,
        long: 'is-online',
        defaultValue: () => true
        //defaultValueIsSerializable: true
      })
    },
    handler: async ({ isOnline }) => {
      const redisOptions = redisService.getRedisOptions<Config>(config)
      const redis = redisService.initRedis(redisOptions, logger)

      const listedProxiesCache = await proxyCacheService.listProxiesCache(redis, {
        isOnline
      })
      logger.info(listedProxiesCache)

      await redisService.closeRedis(redis)
    }
  })
}
