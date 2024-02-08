export type PlanData = Record<string, unknown>

export interface Plan {
  id: number
  sortOrder: number
  categoriesMax: number
  priceRub: number
  durationDays: number
  intervalSec: number
  analyticsOn: boolean
  isEnabled: boolean
  subscriptions: number
  createdAt: Date
  updatedAt: Date
  scheduledAt: Date
}

export interface CreatePlanRequest {
  tgFromId: string
  data: PlanData
}

export interface CreatePlanResponse {
  message: string
  statusCode: number
  plan: Plan
}
