import { ScraperCache } from '../scraper-cache.js'

export interface FetchScraperCacheRequest {
  scraperJobId: string
}

export interface FetchScraperCacheResponse {
  message: string
  statusCode: number
  scraperCache: ScraperCache
}
