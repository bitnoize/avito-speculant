import { ProxyCache } from '../proxy-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchRandomOnlineProxyCacheResponse = {
  proxyCache: ProxyCache
}

export type FetchRandomOnlineProxyCache = RedisMethod<void, FetchRandomOnlineProxyCacheResponse>
