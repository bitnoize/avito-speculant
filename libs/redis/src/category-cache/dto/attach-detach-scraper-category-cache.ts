export interface AttachDetachScraperCategoryCacheRequest {
  categoryId: number
  scraperJobId: string
  timeout: number
}

export interface AttachDetachScraperCategoryCacheResponse {
  message: string
  statusCode: number
}
