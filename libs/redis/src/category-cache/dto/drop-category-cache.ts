export interface DropCategoryCacheRequest {
  categoryId: number
  userId: number
  scraperJobId: string
}

export interface DropCategoryCacheResponse {
  message: string
}
