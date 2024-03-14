export const DEFAULT_PLAN_LIST_ALL = false
export const DEFAULT_PLAN_PRODUCE_LIMIT = 1

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
