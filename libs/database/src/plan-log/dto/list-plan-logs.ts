import { PlanLog } from '@avito-speculant/domain'

export interface ListPlanLogsRequest {
  planId: number
  limit: number
}

export interface ListPlanLogsResponse {
  message: string
  statusCode: number
  planLogs: PlanLog[]
  limit: number
}
