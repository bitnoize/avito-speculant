import { RedisMethod } from '../../redis.js'

export type SaveOnlineProxyCacheRequest = {
  proxyId: number
  sizeBytes: number
  createdAt: number
}

export type SaveOnlineProxyCacheResponse = void

export type SaveOnlineProxyCache = RedisMethod<
  SaveOnlineProxyCacheRequest,
  SaveOnlineProxyCacheResponse
>
