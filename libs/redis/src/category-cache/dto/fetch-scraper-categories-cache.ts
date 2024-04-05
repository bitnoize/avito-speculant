import { CategoryCache } from '../category-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchScraperCategoriesCacheRequest = {
  scraperId: string
}

export type FetchScraperCategoriesCacheResponse = {
  categoriesCache: CategoryCache[]
}

export type FetchScraperCategoriesCache = RedisMethod<
  FetchScraperCategoriesCacheRequest,
  FetchScraperCategoriesCacheResponse
>
