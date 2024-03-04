import { Subscription } from '../subscription.js'
import { SubscriptionLogData } from '../../subscription-log/subscription-log.js'
import { Notify } from '../../database.js'

export interface CreateSubscriptionRequest {
  userId: number
  planId: number
  data: SubscriptionLogData
}

export interface CreateSubscriptionResponse {
  message: string
  statusCode: number
  subscription: Subscription
  backLog: Notify[]
}
