import { UserCache } from '../user-cache.js'

export interface FetchUserCacheRequest {
  userId: number
}

export interface FetchUserCacheResponse {
  userCache: UserCache
}
