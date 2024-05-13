import { CategoryCache } from '../category-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchScraperEnabledCategoriesCacheRequest = {
  scraperId: string
}

export type FetchScraperEnabledCategoriesCacheResponse = {
  categoriesCache: CategoryCache[]
}

export type FetchScraperEnabledCategoriesCache = RedisMethod<
  FetchScraperEnabledCategoriesCacheRequest,
  FetchScraperEnabledCategoriesCacheResponse
>
