export interface DropCategoryCacheRequest {
  categoryId: number
  userId: number
}

export interface DropCategoryCacheResponse {
  message: string
  statusCode: number
}
