import {
  Notify,
  User,
  Plan,
  Subscription,
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
  user: User
  plan: Plan
  subscription: Subscription
  backLog: Notify[]
}
