export interface DropScraperCacheRequest {
  scraperJobId: string
  timeout: number
}

export interface DropScraperCacheResponse {
  message: string
  statusCode: number
}
