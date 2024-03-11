import { CategoryCache } from '../category-cache.js'

export interface FetchCategoryCacheRequest {
  categoryId: number
}

export interface FetchCategoryCacheResponse {
  message: string
  categoryCache: CategoryCache
}
