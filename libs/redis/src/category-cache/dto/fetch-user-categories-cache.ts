import { CategoryCache } from '../category-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchUserCategoriesCacheRequest = {
  userId: number
}

export type FetchUserCategoriesCacheResponse = {
  categoriesCache: CategoryCache[]
}

export type FetchUserCategoriesCache = RedisMethod<
  FetchUserCategoriesCacheRequest,
  FetchUserCategoriesCacheResponse
>
