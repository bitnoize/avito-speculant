import { Notify, Plan, PlanLogData } from '@avito-speculant/domain'

export interface UpdatePlanRequest {
  id: number
  categoriesMax?: number
  priceRub?: number
  durationDays?: number
  intervalSec?: number
  analyticsOn?: boolean
  data: PlanLogData
}

export interface UpdatePlanResponse {
  message: string
  statusCode: number
  plan: Plan
  backLog: Notify[]
}
