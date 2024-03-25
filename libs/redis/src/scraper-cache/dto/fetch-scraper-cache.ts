import { ScraperCache } from '../scraper-cache.js'

export interface FetchScraperCacheRequest {
  scraperId: string
}

export interface FetchScraperCacheResponse {
  scraperCache: ScraperCache
}
