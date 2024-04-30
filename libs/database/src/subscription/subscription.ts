export const SUBSCRIPTION_STATUSES = ['wait', 'cancel', 'active', 'finish']
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number]

export interface Subscription {
  id: number
  userId: number
  planId: number
  priceRub: number
  status: SubscriptionStatus
  createdAt: number
  updatedAt: number
  queuedAt: number
  timeoutAt: number
  finishAt: number
}

export const SUBSCRIPTION_TIMEOUT_AFTER = '15 minutes'
export const SUBSCRIPTION_PRODUCE_AFTER = '1 minute'
