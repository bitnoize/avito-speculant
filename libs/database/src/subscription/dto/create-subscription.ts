import { Notify } from '@avito-speculant/notify'
import { Subscription } from '../subscription.js'
import { SubscriptionLogData } from '../../subscription-log/subscription-log.js'

export interface CreateSubscriptionRequest {
  userId: number
  planId: number
  data: SubscriptionLogData
}

export interface CreateSubscriptionResponse {
  message: string
  subscription: Subscription
  backLog: Notify[]
}
