import { SubscriptionCache } from '../subscription-cache.js'

export interface FetchSubscriptionCacheRequest {
  subscriptionId: number
}

export interface FetchSubscriptionCacheResponse {
  message: string
  subscriptionCache: SubscriptionCache
}
