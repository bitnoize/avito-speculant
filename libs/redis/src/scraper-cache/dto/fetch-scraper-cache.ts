import { ScraperCache } from '../scraper-cache.js'

export interface FetchScraperCacheRequest {
  scraperJobId: string
}

export interface FetchScraperCacheResponse {
  scraperCache: ScraperCache
}
