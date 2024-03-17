import { Proxy } from '../proxy.js'

export interface ProduceProxiesRequest {
  limit: number
}

export interface ProduceProxiesResponse {
  proxies: Proxy[]
}
