import { Proxy } from '../proxy.js'

export interface QueueProxiesRequest {
  limit?: number
}

export interface QueueProxiesResponse {
  message: string
  statusCode: number
  proxies: Proxy[]
  limit: number
}
