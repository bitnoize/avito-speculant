export interface DropSubscriptionCacheRequest {
  subscriptionId: number
  userId: number
  planId: number
  timeout: number
}

export interface DropSubscriptionCacheResponse {
  message: string
  statusCode: number
}
