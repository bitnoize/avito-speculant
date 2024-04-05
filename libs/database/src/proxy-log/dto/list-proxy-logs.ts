import { ProxyLog } from '../proxy-log.js'
import { DatabaseMethod } from '../../database.js'

export type ListProxyLogsRequest = {
  proxyId: number
  limit: number
}

export type ListProxyLogsResponse = {
  proxyLogs: ProxyLog[]
}

export type ListProxyLogs = DatabaseMethod<ListProxyLogsRequest, ListProxyLogsResponse>

