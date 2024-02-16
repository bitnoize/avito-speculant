import { Notify, Plan, PlanLog, PlanLogData } from '@avito-speculant/domain'

export interface SchedulePlansRequest {
  limit: number
  data: PlanLogData
}

export interface SchedulePlansResponse {
  message: string
  statusCode: number
  plans: Plan[]
  backLog: Notify[]
}
