import { PlanLog } from '../plan-log.js'

export interface ListPlanLogsRequest {
  planId: number
  limit: number
}

export interface ListPlanLogsResponse {
  planLogs: PlanLog[]
}
