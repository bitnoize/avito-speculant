import { Plan } from '../plan.js'
import { PlanLogData } from '../../plan-log/plan-log.js'
import { Notify } from '../../database.js'

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
