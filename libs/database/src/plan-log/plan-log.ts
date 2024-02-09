import { PlanData } from '../plan/plan.js'

export interface PlanLog {
  id: string
  planId: number
  action: string
  categoriesMax: number
  priceRub: number
  durationDays: number
  intervalSec: number
  analyticsOn: boolean
  isEnabled: boolean
  subscriptions: number
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
  planLogs: PlanLog[]
  limit: number
}
