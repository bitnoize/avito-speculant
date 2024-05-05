import { RedisMethod } from '../../redis.js'

export type RenewOfflineProxyCacheRequest = {
  proxyId: number
  sizeBytes: number
}

export type RenewOfflineProxyCacheResponse = void

export type RenewOfflineProxyCache = RedisMethod<
  RenewOfflineProxyCacheRequest,
  RenewOfflineProxyCacheResponse
>
