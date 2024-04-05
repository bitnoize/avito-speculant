import { ScraperCache } from '../scraper-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchCategoryScrapersCacheRequest = {
  categoryId: number
}

export type FetchCategoryScrapersCacheResponse = {
  scrapersCache: ScraperCache[]
}

export type FetchCategoryScrapersCache = RedisMethod<
  FetchCategoryScrapersCacheRequest,
  FetchCategoryScrapersCacheResponse
>
