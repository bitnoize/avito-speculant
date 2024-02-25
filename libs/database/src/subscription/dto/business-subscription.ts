import { Notify, Subscription, SubscriptionLogData } from '@avito-speculant/domain'

export interface BusinessSubscriptionRequest {
  subscriptionId: number
  data: SubscriptionLogData
}

export interface BusinessSubscriptionResponse {
  message: string
  statusCode: number
  subscription: Subscription
  backLog: Notify[]
}
