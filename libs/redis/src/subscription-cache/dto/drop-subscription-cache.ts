export interface DropSubscriptionCacheRequest {
  subscriptionId: number
  userId: number
  planId: number
}

export interface DropSubscriptionCacheResponse {
  message: string
  statusCode: number
}
