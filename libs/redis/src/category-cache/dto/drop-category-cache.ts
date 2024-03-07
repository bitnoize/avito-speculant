export interface DropCategoryCacheRequest {
  categoryId: number
  userId: number
  scraperJobId: string
  timeout: number
}

export interface DropCategoryCacheResponse {
  message: string
  statusCode: number
}
