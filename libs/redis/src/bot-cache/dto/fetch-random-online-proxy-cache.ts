import { ProxyCache } from '../proxy-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchRandomOnlineProxyCacheRequest = undefined

export type FetchRandomOnlineProxyCacheResponse = {
  proxyCache: ProxyCache | undefined
}

export type FetchRandomOnlineProxyCache = RedisMethod<
  FetchRandomOnlineProxyCacheRequest,
  FetchRandomOnlineProxyCacheResponse
>
