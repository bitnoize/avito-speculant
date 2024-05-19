import { ProxyCache } from '../proxy-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchProxiesCacheResponse = {
  proxiesCache: ProxyCache[]
}

export type FetchProxiesCache = RedisMethod<void, FetchProxiesCacheResponse>
