export interface DropProxyCacheRequest {
  proxyId: number
  timeout: number
}

export interface DropProxyCacheResponse {
  message: string
  statusCode: number
}
