import { ProxyCache } from '../proxy-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchProxyCacheRequest = {
  proxyId: number
}

export type FetchProxyCacheResponse = {
  proxyCache: ProxyCache
}

export type FetchProxyCache = RedisMethod<FetchProxyCacheRequest, FetchProxyCacheResponse>

