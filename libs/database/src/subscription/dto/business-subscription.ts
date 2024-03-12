import { Notify } from '@avito-speculant/notify'
import { Subscription } from '../subscription.js'
import { SubscriptionLogData } from '../../subscription-log/subscription-log.js'

export interface BusinessSubscriptionRequest {
  subscriptionId: number
  data: SubscriptionLogData
}

export interface BusinessSubscriptionResponse {
  subscription: Subscription
  backLog: Notify[]
}
