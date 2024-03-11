export interface SaveCategoryCacheRequest {
  categoryId: number
  userId: number
  scraperJobId: string
  avitoUrl: string
}

export interface SaveCategoryCacheResponse {
  message: string
}
