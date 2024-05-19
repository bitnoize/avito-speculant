import { RedisMethod } from '../../redis.js'

export type SaveOfflineProxyCacheRequest = {
  proxyId: number
}

export type SaveOfflineProxyCache = RedisMethod<SaveOfflineProxyCacheRequest, void>
