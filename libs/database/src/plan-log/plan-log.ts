import { Plan, PlanData } from '../plan/plan.js'

export interface PlanLog {
  id: string
  planId: number
  action: string
  data: PlanData
  createdAt: number
}

export interface ListPlanLogsRequest {
  planId: number
  limit: number
}

export interface ListPlanLogsResponse {
  message: string
  statusCode: number
  plan: Plan
  planLogs: PlanLog[]
  limit: number
}
