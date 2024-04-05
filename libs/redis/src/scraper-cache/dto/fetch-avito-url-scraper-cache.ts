import { ScraperCache } from '../scraper-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchAvitoUrlScraperCacheRequest = {
  avitoUrl: string
}

export type FetchAvitoUrlScraperCacheResponse = {
  scraperCache: ScraperCache | undefined
}

export type FetchAvitoUrlScraperCache = RedisMethod<
  FetchAvitoUrlScraperCacheRequest,
  FetchAvitoUrlScraperCacheResponse
>
