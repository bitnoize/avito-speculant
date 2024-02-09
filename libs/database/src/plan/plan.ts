export type PlanData = Record<string, unknown>

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

export interface CreatePlanRequest {
  categoriesMax: number
  priceRub: number
  durationDays: number
  intervalSec: number
  analyticsOn: boolean
  data: PlanData
}

export interface CreatePlanResponse {
  message: string
  statusCode: number
  plan: Plan
}
