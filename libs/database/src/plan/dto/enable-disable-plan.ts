import { Notify, Plan, PlanLogData } from '@avito-speculant/domain'

export interface EnableDisablePlanRequest {
  id: number
  data: PlanLogData
}

export interface EnableDisablePlanResponse {
  message: string
  statusCode: number
  plan: Plan
  backLog: Notify[]
}
