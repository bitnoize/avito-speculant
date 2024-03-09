import { ScraperCache } from '../scraper-cache.js'

export interface FindScraperCacheRequest {
  avitoUrl: string
}

export interface FindScraperCacheResponse {
  message: string
  statusCode: number
  scraperCache?: ScraperCache
}
