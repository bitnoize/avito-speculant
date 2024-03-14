export type PlanLogData = Record<string, unknown>

export interface PlanLog {
  id: string
  planId: number
  action: string
  categoriesMax: number
  priceRub: number
  durationDays: number
  intervalSec: number
  analyticsOn: boolean
  isEnabled: boolean
  subscriptions: number
  data: PlanLogData
  createdAt: number
}
