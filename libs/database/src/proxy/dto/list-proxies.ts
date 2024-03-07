import { Proxy } from '../proxy.js'

export interface ListProxiesRequest {
  all?: boolean
}

export interface ListProxiesResponse {
  message: string
  statusCode: number
  proxies: Proxy[]
  all: boolean
}
