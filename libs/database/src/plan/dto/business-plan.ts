import { Notify } from '@avito-speculant/notify'
import { Plan } from '../plan.js'
import { PlanLogData } from '../../plan-log/plan-log.js'

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
