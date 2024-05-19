import { ScraperCache } from '../scraper-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchScrapersCacheResponse = {
  scrapersCache: ScraperCache[]
}

export type FetchScrapersCache = RedisMethod<void, FetchScrapersCacheResponse>
