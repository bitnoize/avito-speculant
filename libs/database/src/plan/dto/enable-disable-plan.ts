import { Notify } from '@avito-speculant/common'
import { Plan } from '../plan.js'
import { PlanLogData } from '../../plan-log/plan-log.js'

export interface EnableDisablePlanRequest {
  planId: number
  data: PlanLogData
}

export interface EnableDisablePlanResponse {
  plan: Plan
  backLog: Notify[]
}
