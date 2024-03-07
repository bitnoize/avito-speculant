export interface SaveProxyCacheRequest {
  proxyId: number
  proxyUrl: string
  isOnline: boolean
  timeout: number
}

export interface SaveProxyCacheResponse {
  message: string
  statusCode: number
}
