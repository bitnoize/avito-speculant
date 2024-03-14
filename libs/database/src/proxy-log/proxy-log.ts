export type ProxyLogData = Record<string, unknown>

export interface ProxyLog {
  id: string
  proxyId: number
  action: string
  isEnabled: boolean
  data: ProxyLogData
  createdAt: number
}
