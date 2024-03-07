export const DEFAULT_PROXY_LOG_LIST_LIMIT = 100

export type ProxyLogData = Record<string, unknown>

export interface ProxyLog {
  id: string
  proxyId: number
  action: string
  isEnabled: boolean
  isOnline: boolean
  data: ProxyLogData
  createdAt: number
}
