import { Proxy } from '../proxy.js'

export interface ListProxiesRequest {
  all?: boolean
}

export interface ListProxiesResponse {
  proxies: Proxy[]
}
