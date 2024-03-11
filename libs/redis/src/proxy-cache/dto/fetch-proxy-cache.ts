import { ProxyCache } from '../proxy-cache.js'

export interface FetchProxyCacheRequest {
  proxyId: number
}

export interface FetchProxyCacheResponse {
  message: string
  proxyCache: ProxyCache
}