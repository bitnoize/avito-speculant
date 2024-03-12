import { SubscriptionCache } from '../subscription-cache.js'

export interface FetchPlanSubscriptionsCacheRequest {
  planId: number
}

export interface FetchPlanSubscriptionsCacheResponse {
  subscriptionsCache: SubscriptionCache[]
}
