export interface SaveCategoryCacheRequest {
  categoryId: number
  userId: number
  avitoUrl: string
  timeout: number
}

export interface SaveCategoryCacheResponse {
  message: string
  statusCode: number
}
