import { SubscriptionStatus } from '../subscription/subscription.js'

export const DEFAULT_SUBSCRIPTION_LOG_LIST_LIMIT = 100

export type SubscriptionLogData = Record<string, unknown>

export interface SubscriptionLog {
  id: string
  subscriptionId: number
  action: string
  status: SubscriptionStatus
  data: SubscriptionLogData
  createdAt: number
}
