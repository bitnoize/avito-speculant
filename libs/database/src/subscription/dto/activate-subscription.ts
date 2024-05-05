import { Notify } from '@avito-speculant/common'
import { Subscription } from '../subscription.js'
import { SubscriptionLogData } from '../../subscription-log/subscription-log.js'
import { User } from '../../user/user.js'
import { Plan } from '../../plan/plan.js'
import { DatabaseMethod } from '../../database.js'

export type ActivateSubscriptionRequest = {
  userId: number
  subscriptionId: number
  data: SubscriptionLogData
}

export type ActivateSubscriptionResponse = {
  user: User
  subscription: Subscription
  plan: Plan
  previousSubscription: Subscription | undefined
  previousPlan: Plan | undefined
  backLog: Notify[]
}

export type ActivateSubscription = DatabaseMethod<
  ActivateSubscriptionRequest,
  ActivateSubscriptionResponse
>
