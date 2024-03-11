import { Subscription } from '../subscription.js'

export interface ListSubscriptionsRequest {
  userId: number
  all?: boolean
}

export interface ListSubscriptionsResponse {
  message: string
  subscriptions: Subscription[]
  all: boolean
}
