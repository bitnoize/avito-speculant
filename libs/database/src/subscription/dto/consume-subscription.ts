import { Notify } from '@avito-speculant/notify'
import { Subscription } from '../subscription.js'
import { SubscriptionLogData } from '../../subscription-log/subscription-log.js'

export interface ConsumeSubscriptionRequest {
  subscriptionId: number
  data: SubscriptionLogData
}

export interface ConsumeSubscriptionResponse {
  subscription: Subscription
  backLog: Notify[]
}
