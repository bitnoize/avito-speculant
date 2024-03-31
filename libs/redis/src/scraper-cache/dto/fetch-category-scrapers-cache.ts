import { ScraperCache } from '../scraper-cache.js'

export interface FetchCategoryScrapersCacheRequest {
  categoryId: number
}

export interface FetchCategoryScrapersCacheResponse {
  scrapersCache: ScraperCache[]
}
