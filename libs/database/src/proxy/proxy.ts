export const DEFAULT_PROXY_LIST_ALL = false
export const DEFAULT_PROXY_PRODUCE_LIMIT = 10

export interface Proxy {
  id: number
  proxyUrl: string
  isEnabled: boolean
  createdAt: number
  updatedAt: number
  queuedAt: number
}
