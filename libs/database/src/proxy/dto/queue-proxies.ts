import { Proxy } from '../proxy.js'

export interface QueueProxiesRequest {
  limit?: number
}

export interface QueueProxiesResponse {
  proxies: Proxy[]
  limit: number
}
