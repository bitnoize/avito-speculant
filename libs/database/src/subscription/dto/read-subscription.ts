import { Subscription } from '../subscription.js'
import { Plan } from '../../plan/plan.js'
import { DatabaseMethod } from '../../database.js'

export type ReadSubscriptionRequest = {
  userId: number
  subscriptionId: number
}

export type ReadSubscriptionResponse = {
  subscription: Subscription
  plan: Plan
}

export type ReadSubscription = DatabaseMethod<ReadSubscriptionRequest, ReadSubscriptionResponse>
