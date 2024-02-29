import { ScraperCache } from '../scraper-cache.js'

export interface ListScrapersCacheRequest {
}

export interface ListScrapersCacheResponse {
  message: string
  statusCode: number
  scrapersCache: ScraperCache[]
}
