import { ProxyLog } from '../proxy-log.js'

export interface ListProxyLogsRequest {
  proxyId: number
  limit: number
}

export interface ListProxyLogsResponse {
  proxyLogs: ProxyLog[]
}
