import { Notify, Plan, PlanLog, PlanLogData } from '@avito-speculant/domain'

export interface CreatePlanRequest {
  categoriesMax: number
  priceRub: number
  durationDays: number
  intervalSec: number
  analyticsOn: boolean
  data: PlanLogData
}

export interface CreatePlanResponse {
  message: string
  statusCode: number
  plan: Plan
  backLog: Notify[]
}
