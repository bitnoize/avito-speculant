import { SubscriptionCache } from '../subscription-cache.js'

export interface FetchSubscriptionCacheRequest {
  subscriptionId: number
}

export interface FetchSubscriptionCacheResponse {
  subscriptionCache: SubscriptionCache
}
