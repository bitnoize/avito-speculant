import { ScraperCache } from '../scraper-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchScraperCacheRequest = {
  scraperId: string
}

export type FetchScraperCacheResponse = {
  scraperCache: ScraperCache
}

export type FetchScraperCache = RedisMethod<FetchScraperCacheRequest, FetchScraperCacheResponse>
