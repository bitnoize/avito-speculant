import { CacheScraper } from '../cache.js'

export interface ListCacheScrapersRequest {
}

export interface ListCacheScrapersResponse {
  message: string
  statusCode: number
  cacheScrapers: CacheScraper[]
}
