export interface Proxy {
  id: number
  url: string
  isEnabled: boolean
  createdAt: number
  updatedAt: number
  queuedAt: number
}

export const PROXY_PRODUCE_AFTER = '5 minutes'
