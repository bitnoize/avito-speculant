import { CategoryCache } from '../category-cache.js'

export interface FetchUserCategoriesCacheRequest {
  userId: number
}

export interface FetchUserCategoriesCacheResponse {
  categoriesCache: CategoryCache[]
}
