import { SubscriptionStatus } from '../subscription/subscription.js'

export type SubscriptionLogData = Record<string, unknown>

export interface SubscriptionLog {
  id: string
  subscriptionId: number
  action: string
  status: SubscriptionStatus
  data: SubscriptionLogData
  createdAt: number
}
