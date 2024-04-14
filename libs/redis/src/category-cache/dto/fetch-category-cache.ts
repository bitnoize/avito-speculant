import { CategoryCache } from '../category-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchCategoryCacheRequest = {
  categoryId: number
}

export type FetchCategoryCacheResponse = {
  categoryCache: CategoryCache
}

export type FetchCategoryCache = RedisMethod<FetchCategoryCacheRequest, FetchCategoryCacheResponse>
