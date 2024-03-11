import { CategoryCache } from '../category-cache.js'

export interface ListUserCategoriesCacheRequest {
  userId: number
}

export interface ListUserCategoriesCacheResponse {
  message: string
  categoriesCache: CategoryCache[]
}