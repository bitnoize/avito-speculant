export const MINIMUM_PLAN_CATEGORIES_MAX = 1
export const MAXIMUM_PLAN_CATEGORIES_MAX = 1000

export const MINIMUM_PLAN_PRICE_RUB = 0
export const MAXIMUM_PLAN_PRICE_RUB = 1_000_000

export const MINIMUM_PLAN_DURATION_DAYS = 1
export const MAXIMUM_PLAN_DURATION_DAYS = 365

export const MINIMUM_PLAN_INTERVAL_SEC = 1
export const MAXIMUM_PLAN_INTERVAL_SEC = 3600

export interface Plan {
  id: number
  categoriesMax: number
  priceRub: number
  durationDays: number
  intervalSec: number
  analyticsOn: boolean
  isEnabled: boolean
  subscriptions: number
  createdAt: number
  updatedAt: number
  queuedAt: number
}
