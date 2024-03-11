import { CategoryCache } from '../category-cache.js'

export interface ListScraperCategoriesCacheRequest {
  scraperJobId: string
}

export interface ListScraperCategoriesCacheResponse {
  message: string
  categoriesCache: CategoryCache[]
}
