import { Notify } from '@avito-speculant/common'
import { Subscription } from '../subscription.js'
import { SubscriptionLogData } from '../../subscription-log/subscription-log.js'
import { DatabaseMethod } from '../../database.js'

export type ActivateSubscriptionRequest = {
  userId: number
  subscriptionId: number
  data: SubscriptionLogData
}

export type ActivateSubscriptionResponse = {
  subscription: Subscription
  previousSubscription: Subscription | undefined
  backLog: Notify[]
}

export type ActivateSubscription = DatabaseMethod<
  ActivateSubscriptionRequest,
  ActivateSubscriptionResponse
>
