import { RedisMethod } from '../../redis.js'

export type SaveOnlineProxyCacheRequest = {
  proxyId: number
  createdAt: number
}

export type SaveOnlineProxyCache = RedisMethod<SaveOnlineProxyCacheRequest, void>
