import { CategoryCache } from '../category-cache.js'

export interface ListUserCategoriesCacheRequest {
  userId: number
}

export interface ListUserCategoriesCacheResponse {
  message: string
  statusCode: number
  categoriesCache: CategoryCache[]
}
