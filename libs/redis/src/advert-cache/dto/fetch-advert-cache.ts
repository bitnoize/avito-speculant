import { AdvertCache } from '../advert-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchAdvertCacheRequest = {
  scraperId: string
  advertId: number
}

export type FetchAdvertCacheResponse = {
  advertCache: AdvertCache
}

export type FetchAdvertCache = RedisMethod<FetchAdvertCacheRequest, FetchAdvertCacheResponse>
