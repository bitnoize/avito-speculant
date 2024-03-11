import { Notify } from '@avito-speculant/notify'
import { Plan } from '../plan.js'
import { PlanLogData } from '../../plan-log/plan-log.js'

export interface EnableDisablePlanRequest {
  planId: number
  data: PlanLogData
}

export interface EnableDisablePlanResponse {
  message: string
  plan: Plan
  backLog: Notify[]
}
