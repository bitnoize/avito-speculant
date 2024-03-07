import { Notify } from '@avito-speculant/notify'
import { Plan } from '../plan.js'
import { PlanLogData } from '../../plan-log/plan-log.js'

export interface UpdatePlanRequest {
  planId: number
  categoriesMax?: number
  priceRub?: number
  durationDays?: number
  intervalSec?: number
  analyticsOn?: boolean
  data: PlanLogData
}

export interface UpdatePlanResponse {
  message: string
  statusCode: number
  plan: Plan
  backLog: Notify[]
}
