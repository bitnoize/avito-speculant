export const SUBSCRIPTION_STATUSES = ['wait', 'cancel', 'active', 'finish']
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number]

export interface Subscription {
  id: number
  userId: number
  planId: number
  categoriesMax: number
  priceRub: number
  durationDays: number
  intervalSec: number
  analyticsOn: boolean
  status: SubscriptionStatus
  createdAt: number
  updatedAt: number
  scheduledAt: number
}
