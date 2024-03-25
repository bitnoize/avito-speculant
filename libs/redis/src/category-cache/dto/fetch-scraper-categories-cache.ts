import { CategoryCache } from '../category-cache.js'

export interface FetchScraperCategoriesCacheRequest {
  scraperId: string
}

export interface FetchScraperCategoriesCacheResponse {
  categoriesCache: CategoryCache[]
}
