import { RedisMethod } from '../../redis.js'

export type RenewOnlineProxyCacheRequest = {
  proxyId: number
  sizeBytes: number
}

export type RenewOnlineProxyCacheResponse = void

export type RenewOnlineProxyCache = RedisMethod<
  RenewOnlineProxyCacheRequest,
  RenewOnlineProxyCacheResponse
>
