import { Notify } from '@avito-speculant/notify'
import { Plan } from '../plan.js'
import { PlanLogData } from '../../plan-log/plan-log.js'

export interface ConsumePlanRequest {
  planId: number
  data: PlanLogData
}

export interface ConsumePlanResponse {
  plan: Plan
  backLog: Notify[]
}
