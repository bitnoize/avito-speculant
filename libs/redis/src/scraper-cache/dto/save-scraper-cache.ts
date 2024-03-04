export interface SaveScraperCacheRequest {
  scraperJobId: string
  avitoUrl: string
  intervalSec: number
  timeout: number
}

export interface SaveScraperCacheResponse {
  message: string
  statusCode: number
}
