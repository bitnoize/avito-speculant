export interface DropUserCacheRequest {
  userId: number
  timeout: number
}

export interface DropUserCacheResponse {
  message: string
  statusCode: number
}
