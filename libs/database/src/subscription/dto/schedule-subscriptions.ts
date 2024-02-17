import { Notify, Subscription, SubscriptionLogData } from '@avito-speculant/domain'

export interface ScheduleSubscriptionsRequest {
  limit: number
  data: SubscriptionLogData
}

export interface ScheduleSubscriptionsResponse {
  message: string
  statusCode: number
  subscriptions: Subscription[]
  backLog: Notify[]
}
