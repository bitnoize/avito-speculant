import { AdvertCache } from '../advert-cache.js'

export interface FetchScraperAdvertsCacheRequest {
  scraperId: string
}

export interface FetchScraperAdvertsCacheResponse {
  advertsCache: AdvertCache[]
}
