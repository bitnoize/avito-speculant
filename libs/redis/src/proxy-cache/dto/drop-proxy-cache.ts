import { RedisMethod } from '../../redis.js'

export type DropProxyCacheRequest = {
  proxyId: number
}

export type DropProxyCacheResponse = void

export type DropProxyCache = RedisMethod<DropProxyCacheRequest, DropProxyCacheResponse>
