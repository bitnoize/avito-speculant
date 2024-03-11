export interface SaveProxyCacheRequest {
  proxyId: number
  proxyUrl: string
  isOnline: boolean
}

export interface SaveProxyCacheResponse {
  message: string
}
