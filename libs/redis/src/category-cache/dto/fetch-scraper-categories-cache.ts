import { CategoryCache } from '../category-cache.js'

export interface FetchScraperCategoriesCacheRequest {
  scraperJobId: string
}

export interface FetchScraperCategoriesCacheResponse {
  categoriesCache: CategoryCache[]
}
