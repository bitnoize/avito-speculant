import { SubscriptionCache } from '../subscription-cache.js'

export interface FetchUserSubscriptionCacheRequest {
  userId: number
}

export interface FetchUserSubscriptionCacheResponse {
  subscriptionCache: SubscriptionCache
}
