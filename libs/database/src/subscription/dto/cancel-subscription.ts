import { Notify } from '@avito-speculant/notify'
import { Subscription } from '../subscription.js'
import { SubscriptionLogData } from '../../subscription-log/subscription-log.js'

export interface CancelSubscriptionRequest {
  subscriptionId: number
  data: SubscriptionLogData
}

export interface CancelSubscriptionResponse {
  message: string
  subscription: Subscription
  backLog: Notify[]
}
