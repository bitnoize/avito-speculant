import { AdvertCache } from '../advert-cache.js'

export interface FetchAdvertCacheRequest {
  advertId: number
}

export interface FetchAdvertCacheResponse {
  advertCache: AdvertCache
}
