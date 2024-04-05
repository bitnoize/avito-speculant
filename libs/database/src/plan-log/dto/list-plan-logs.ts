import { PlanLog } from '../plan-log.js'
import { DatabaseMethod } from '../../database.js'

export type ListPlanLogsRequest = {
  planId: number
  limit: number
}

export type ListPlanLogsResponse = {
  planLogs: PlanLog[]
}

export type ListPlanLogs = DatabaseMethod<ListPlanLogsRequest, ListPlanLogsResponse>
