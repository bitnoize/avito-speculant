import { AdvertCache } from '../advert-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchAdvertsCacheRequest = {
  scraperId: string
}

export type FetchAdvertsCacheResponse = {
  advertsCache: AdvertCache[]
}

export type FetchAdvertsCache = RedisMethod<FetchAdvertsCacheRequest, FetchAdvertsCacheResponse>
