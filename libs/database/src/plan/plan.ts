export const MIN_PLAN_CATEGORIES_MAX = 1
export const MAX_PLAN_CATEGORIES_MAX = 100

export const MIN_PLAN_PRICE_RUB = 100
export const MAX_PLAN_PRICE_RUB = 100_000

export const MIN_PLAN_DURATION_DAYS = 1
export const MAX_PLAN_DURATION_DAYS = 365

export const MIN_PLAN_INTERVAL_SEC = 1
export const MAX_PLAN_INTERVAL_SEC = 3600

export interface Plan {
  id: number
  categoriesMax: number
  durationDays: number
  intervalSec: number
  analyticsOn: boolean
  priceRub: number
  isEnabled: boolean
  subscriptions: number
  createdAt: number
  updatedAt: number
  queuedAt: number
}

export const PLAN_PRODUCE_AFTER = '5 minutes'
