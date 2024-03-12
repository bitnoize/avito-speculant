import { Notify } from '@avito-speculant/notify'
import { Subscription } from '../subscription.js'
import { SubscriptionLogData } from '../../subscription-log/subscription-log.js'
import { User } from '../../user/user.js'

export interface ActivateSubscriptionRequest {
  subscriptionId: number
  data: SubscriptionLogData
}

export interface ActivateSubscriptionResponse {
  subscription: Subscription
  user: User
  backLog: Notify[]
}
