import { AdvertCache } from '../advert-cache.js'

export interface FetchCategoryAdvertsCacheRequest {
  categoryId: number
  topic: string
}

export interface FetchCategoryAdvertsCacheResponse {
  advertsCache: AdvertCache[]
}
