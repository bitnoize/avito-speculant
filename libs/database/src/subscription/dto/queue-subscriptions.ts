import { Subscription } from '../subscription.js'

export interface QueueSubscriptionsRequest {
  limit?: number
}

export interface QueueSubscriptionsResponse {
  subscriptions: Subscription[]
  limit: number
}
