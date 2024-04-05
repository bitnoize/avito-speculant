import { RedisMethod } from '../../redis.js'

export type SaveProxyCacheRequest = {
  proxyId: number
  proxyUrl: string
}

export type SaveProxyCacheResponse = void

export type SaveProxyCache = RedisMethod<SaveProxyCacheRequest, SaveProxyCacheResponse>
