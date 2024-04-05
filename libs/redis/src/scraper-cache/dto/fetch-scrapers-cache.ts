import { ScraperCache } from '../scraper-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchScrapersCacheRequest = undefined

export type FetchScrapersCacheResponse = {
  scrapersCache: ScraperCache[]
}

export type FetchScrapersCache = RedisMethod<FetchScrapersCacheRequest, FetchScrapersCacheResponse>
