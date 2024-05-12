import { Notify } from '@avito-speculant/common'
import { Subscription } from '../subscription.js'
import { SubscriptionLogData } from '../../subscription-log/subscription-log.js'
import { DatabaseMethod } from '../../database.js'

export type ConsumeSubscriptionRequest = {
  entityId: number
  data: SubscriptionLogData
}

export type ConsumeSubscriptionResponse = {
  subscription: Subscription
  backLog: Notify[]
}

export type ConsumeSubscription = DatabaseMethod<
  ConsumeSubscriptionRequest,
  ConsumeSubscriptionResponse
>
