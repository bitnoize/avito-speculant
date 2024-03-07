import { Subscription } from '../subscription.js'

export interface QueueSubscriptionsRequest {
  limit?: number
}

export interface QueueSubscriptionsResponse {
  message: string
  statusCode: number
  subscriptions: Subscription[]
  limit: number
}
