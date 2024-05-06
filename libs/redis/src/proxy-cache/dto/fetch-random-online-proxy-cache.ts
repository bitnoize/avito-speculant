import { ProxyCache } from '../proxy-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchRandomOnlineProxyCacheRequest = void

export type FetchRandomOnlineProxyCacheResponse = {
  proxyCache: ProxyCache | undefined
}

export type FetchRandomOnlineProxyCache = RedisMethod<
  FetchRandomOnlineProxyCacheRequest,
  FetchRandomOnlineProxyCacheResponse
>
