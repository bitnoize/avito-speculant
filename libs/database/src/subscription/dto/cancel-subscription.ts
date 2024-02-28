import {
  Notify,
  User,
  Plan,
  Subscription,
  SubscriptionLogData
} from '@avito-speculant/domain'

export interface CancelSubscriptionRequest {
  userId: number
  subscriptionId: number
  data: SubscriptionLogData
}

export interface CancelSubscriptionResponse {
  message: string
  statusCode: number
  user: User
  plan: Plan
  subscription: Subscription
  backLog: Notify[]
}
