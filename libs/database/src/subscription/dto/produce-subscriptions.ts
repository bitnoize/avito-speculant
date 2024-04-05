import { Subscription } from '../subscription.js'
import { DatabaseMethod } from '../../database.js'

export type ProduceSubscriptionsRequest = {
  limit: number
}

export type ProduceSubscriptionsResponse = {
  subscriptions: Subscription[]
}

export type ProduceSubscriptions = DatabaseMethod<
  ProduceSubscriptionsRequest,
  ProduceSubscriptionsResponse
>
