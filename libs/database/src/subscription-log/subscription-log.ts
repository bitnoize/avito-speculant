import { SubscriptionStatus } from '../subscription/subscription.js'

export type SubscriptionLogData = Record<string, unknown>

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
  data: SubscriptionLogData
  createdAt: number
}
