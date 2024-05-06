import { RedisMethod } from '../../redis.js'

export type SaveOfflineProxyCacheRequest = {
  proxyId: number
  sizeBytes: number
}

export type SaveOfflineProxyCacheResponse = void

export type SaveOfflineProxyCache = RedisMethod<
  SaveOfflineProxyCacheRequest,
  SaveOfflineProxyCacheResponse
>
