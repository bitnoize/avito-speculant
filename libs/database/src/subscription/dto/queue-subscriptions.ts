import { Subscription } from '../subscription.js'

export interface QueueSubscriptionsRequest {
  limit?: number
}

export interface QueueSubscriptionsResponse {
  message: string
  subscriptions: Subscription[]
  limit: number
}
