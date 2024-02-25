import { Notify, Plan, PlanLogData } from '@avito-speculant/domain'

export interface BusinessPlanRequest {
  planId: number
  data: PlanLogData
}

export interface BusinessPlanResponse {
  message: string
  statusCode: number
  plan: Plan
  backLog: Notify[]
}
