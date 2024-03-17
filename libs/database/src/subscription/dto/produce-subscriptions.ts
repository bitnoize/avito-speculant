import { Subscription } from '../subscription.js'

export interface ProduceSubscriptionsRequest {
  limit: number
}

export interface ProduceSubscriptionsResponse {
  subscriptions: Subscription[]
}
