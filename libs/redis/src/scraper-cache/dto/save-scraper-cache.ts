export interface SaveScraperCacheRequest {
  scraperJobId: string
  avitoUrl: string
  intervalSec: number
}

export interface SaveScraperCacheResponse {
  message: string
  statusCode: number
}
