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
  scheduledAt: number
}
