export interface SaveUserCacheRequest {
  userId: number
  tgFromId: string
  timeout: number
}

export interface SaveUserCacheResponse {
  message: string
  statusCode: number
}
