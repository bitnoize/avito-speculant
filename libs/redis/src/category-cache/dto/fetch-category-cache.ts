import { CategoryCache } from '../category-cache.js'

export interface FetchCategoryCacheRequest {
  categoryId: number
}

export interface FetchCategoryCacheResponse {
  categoryCache: CategoryCache
}
