import { Notify } from '@avito-speculant/common'
import { Subscription } from '../subscription.js'
import { SubscriptionLogData } from '../../subscription-log/subscription-log.js'
import { User } from '../../user/user.js'
import { DatabaseMethod } from '../../database.js'

export type ActivateSubscriptionRequest = {
  subscriptionId: number
  data: SubscriptionLogData
}

export type ActivateSubscriptionResponse = {
  subscription: Subscription
  user: User
  backLog: Notify[]
}

export type ActivateSubscription = DatabaseMethod<
  ActivateSubscriptionRequest,
  ActivateSubscriptionResponse
>
