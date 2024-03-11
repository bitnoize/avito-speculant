export interface SaveSubscriptionCacheRequest {
  subscriptionId: number
  userId: number
  planId: number
  categoriesMax: number
  priceRub: number
  durationDays: number
  intervalSec: number
  analyticsOn: boolean
}

export interface SaveSubscriptionCacheResponse {
  message: string
}
