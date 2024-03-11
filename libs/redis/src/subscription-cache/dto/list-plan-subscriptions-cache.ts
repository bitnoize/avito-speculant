import { SubscriptionCache } from '../subscription-cache.js'

export interface ListPlanSubscriptionsCacheRequest {
  planId: number
}

export interface ListPlanSubscriptionsCacheResponse {
  message: string
  subscriptionsCache: SubscriptionCache[]
}
