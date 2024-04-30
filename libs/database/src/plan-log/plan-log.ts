export type PlanLogData = Record<string, unknown>

export interface PlanLog {
  id: string
  planId: number
  action: string
  priceRub: number
  isEnabled: boolean
  subscriptions: number
  data: PlanLogData
  createdAt: number
}
