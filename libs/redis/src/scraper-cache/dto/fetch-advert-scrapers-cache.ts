import { ScraperCache } from '../scraper-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchAdvertScrapersCacheRequest = {
  advertId: number
}

export type FetchAdvertScrapersCacheResponse = {
  scrapersCache: ScraperCache[]
}

export type FetchAdvertScrapersCache = RedisMethod<
  FetchAdvertScrapersCacheRequest,
  FetchAdvertScrapersCacheResponse
>
