import { ScraperCache } from '../scraper-cache.js'

export interface FetchAvitoUrlScraperCacheRequest {
  avitoUrl: string
}

export interface FetchAvitoUrlScraperCacheResponse {
  scraperCache: ScraperCache | undefined
}
