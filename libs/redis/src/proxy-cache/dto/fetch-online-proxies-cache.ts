import { ProxyCache } from '../proxy-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchOnlineProxiesCacheRequest = void

export type FetchOnlineProxiesCacheResponse = {
  proxiesCache: ProxyCache[]
}

export type FetchOnlineProxiesCache = RedisMethod<
  FetchOnlineProxiesCacheRequest,
  FetchOnlineProxiesCacheResponse
>
