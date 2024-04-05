import { Subscription } from '../subscription.js'
import { DatabaseMethod } from '../../database.js'

export type ListSubscriptionsRequest = {
  userId: number
  all?: boolean
}

export type ListSubscriptionsResponse = {
  subscriptions: Subscription[]
}

export type ListSubscriptions = DatabaseMethod<
  ListSubscriptionsRequest,
  ListSubscriptionsResponse
>
