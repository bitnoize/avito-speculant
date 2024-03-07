export interface SaveCategoryCacheRequest {
  categoryId: number
  userId: number
  scraperJobId: string
  avitoUrl: string
  timeout: number
}

export interface SaveCategoryCacheResponse {
  message: string
  statusCode: number
}
