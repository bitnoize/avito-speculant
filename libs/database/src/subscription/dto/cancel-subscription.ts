import { Notify, Subscription, SubscriptionLogData } from '@avito-speculant/domain'

export interface CancelSubscriptionRequest {
  id: number
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
