import { CategoryCache } from '../category-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchUserCategoryCacheRequest = {
  userId: number
  categoryId: number
}

export type FetchUserCategoryCacheResponse = {
  categoryCache: CategoryCache
}

export type FetchUserCategoryCache = RedisMethod<
  FetchUserCategoryCacheRequest,
  FetchUserCategoryCacheResponse
>
