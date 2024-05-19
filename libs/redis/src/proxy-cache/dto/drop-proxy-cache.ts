import { RedisMethod } from '../../redis.js'

export type DropProxyCacheRequest = {
  proxyId: number
}

export type DropProxyCache = RedisMethod<DropProxyCacheRequest, void>
