import { AdvertCache } from '../advert-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchScraperAdvertsCacheRequest = {
  scraperId: string
}

export type FetchScraperAdvertsCacheResponse = {
  advertsCache: AdvertCache[]
}

export type FetchScraperAdvertsCache = RedisMethod<
  FetchScraperAdvertsCacheRequest,
  FetchScraperAdvertsCacheResponse
>
