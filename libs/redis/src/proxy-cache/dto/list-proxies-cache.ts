import { ProxyCache } from '../proxy-cache.js'

export interface ListProxiesCacheRequest {
  isOnline: boolean
}

export interface ListProxiesCacheResponse {
  message: string
  statusCode: number
  proxiesCache: ProxyCache[]
}
