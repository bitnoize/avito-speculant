import { Subscription } from '../subscription.js'
import { SubscriptionLogData } from '../../subscription-log/subscription-log.js'
import { Notify } from '../../database.js'

export interface CancelSubscriptionRequest {
  subscriptionId: number
  userId: number
  data: SubscriptionLogData
}

export interface CancelSubscriptionResponse {
  message: string
  statusCode: number
  subscription: Subscription
  backLog: Notify[]
}
