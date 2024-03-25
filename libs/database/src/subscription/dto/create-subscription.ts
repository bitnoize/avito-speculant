import { Notify } from '@avito-speculant/common'
import { Subscription } from '../subscription.js'
import { SubscriptionLogData } from '../../subscription-log/subscription-log.js'

export interface CreateSubscriptionRequest {
  userId: number
  planId: number
  data: SubscriptionLogData
}

export interface CreateSubscriptionResponse {
  subscription: Subscription
  backLog: Notify[]
}
