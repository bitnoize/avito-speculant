import { ScraperCache } from '../scraper-cache.js'

export interface FetchAdvertScrapersCacheRequest {
  advertId: number
}

export interface FetchAdvertScrapersCacheResponse {
  scrapersCache: ScraperCache[]
}
