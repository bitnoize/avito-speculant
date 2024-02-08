import {
  Subscription,
  SubscriptionStatus,
  SubscriptionData
} from '../subscription/subscription.js'

export interface SubscriptionLog {
  id: string
  subscriptionId: number
  action: string
  categoriesMax: number
  priceRub: number
  durationDays: number
  intervalSec: number
  analyticsOn: boolean
  status: SubscriptionStatus
  data: SubscriptionData
  createdAt: Date
}

export interface ListSubscriptionLogsRequest {
  subscriptionId: number
  limit: number
}

export interface ListSubscriptionLogsResponse {
  subscription: Subscription
  subscriptionLogs: SubscriptionLog[]
  limit: number
}
