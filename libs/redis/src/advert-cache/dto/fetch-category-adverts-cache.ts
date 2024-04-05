import { RedisMethod } from '../../redis.js'
import { AdvertCache, CategoryAdvertTopic } from '../advert-cache.js'

export type FetchCategoryAdvertsCacheRequest = {
  categoryId: number
  topic: CategoryAdvertTopic
}

export type FetchCategoryAdvertsCacheResponse = {
  advertsCache: AdvertCache[]
}

export type FetchCategoryAdvertsCache = RedisMethod<
  FetchCategoryAdvertsCacheRequest,
  FetchCategoryAdvertsCacheResponse
>
