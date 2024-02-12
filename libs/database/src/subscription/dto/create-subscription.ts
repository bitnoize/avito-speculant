import {
  Notify,
  Subscription,
  SubscriptionLog,
  SubscriptionLogData
} from '@avito-speculant/domain'

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
