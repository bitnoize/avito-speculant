import { Subscription } from '../subscription.js'

export interface ListSubscriptionsRequest {
  userId: number
  all: boolean
}

export interface ListSubscriptionsResponse {
  message: string
  statusCode: number
  subscriptions: Subscription[]
  all: boolean
}
