import { ScraperCache } from '../scraper-cache.js'

export interface ListScrapersCacheResponse {
  message: string
  scrapersCache: ScraperCache[]
}
