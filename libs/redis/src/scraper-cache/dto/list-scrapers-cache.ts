import { ScraperCache } from '../scraper-cache.js'

export interface ListScrapersCacheResponse {
  message: string
  statusCode: number
  scrapersCache: ScraperCache[]
}
