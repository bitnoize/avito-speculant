import { RedisMethod } from '../../redis.js'

export type SaveProxyCacheRequest = {
  proxyId: number
  url: string
  isEnabled: boolean
  createdAt: number
  updatedAt: number
  queuedAt: number
}

export type SaveProxyCache = RedisMethod<SaveProxyCacheRequest, void>
