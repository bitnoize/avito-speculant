import { ProxyCache } from '../proxy-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchProxiesCacheRequest = void

export type FetchProxiesCacheResponse = {
  proxiesCache: ProxyCache[]
}

export type FetchProxiesCache = RedisMethod<FetchProxiesCacheRequest, FetchProxiesCacheResponse>
