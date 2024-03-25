import { Notify } from '@avito-speculant/common'
import { Subscription } from '../subscription.js'
import { SubscriptionLogData } from '../../subscription-log/subscription-log.js'

export interface CancelSubscriptionRequest {
  subscriptionId: number
  data: SubscriptionLogData
}

export interface CancelSubscriptionResponse {
  subscription: Subscription
  backLog: Notify[]
}
