import { Notify } from '@avito-speculant/common'
import { Subscription } from '../subscription.js'
import { SubscriptionLogData } from '../../subscription-log/subscription-log.js'
import { DatabaseMethod } from '../../database.js'

export type CreateSubscriptionRequest = {
  userId: number
  planId: number
  data: SubscriptionLogData
}

export type CreateSubscriptionResponse = {
  subscription: Subscription
  backLog: Notify[]
}

export type CreateSubscription = DatabaseMethod<
  CreateSubscriptionRequest,
  CreateSubscriptionResponse
>
