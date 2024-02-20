import { Notify, Plan, PlanLogData } from '@avito-speculant/domain'

export interface EnableDisablePlanRequest {
  planId: number
  data: PlanLogData
}

export interface EnableDisablePlanResponse {
  message: string
  statusCode: number
  plan: Plan
  backLog: Notify[]
}
