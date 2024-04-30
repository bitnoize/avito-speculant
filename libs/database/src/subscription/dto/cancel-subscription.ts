import { Notify } from '@avito-speculant/common'
import { Subscription } from '../subscription.js'
import { SubscriptionLogData } from '../../subscription-log/subscription-log.js'
import { DatabaseMethod } from '../../database.js'

export type CancelSubscriptionRequest = {
  userId: number
  subscriptionId: number
  data: SubscriptionLogData
}

export type CancelSubscriptionResponse = {
  subscription: Subscription
  backLog: Notify[]
}

export type CancelSubscription = DatabaseMethod<
  CancelSubscriptionRequest,
  CancelSubscriptionResponse
>
