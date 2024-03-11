import { Notify } from '@avito-speculant/notify'
import { Plan } from '../plan.js'
import { PlanLogData } from '../../plan-log/plan-log.js'

export interface CreatePlanRequest {
  categoriesMax: number
  priceRub: number
  durationDays: number
  intervalSec: number
  analyticsOn: boolean
  data: PlanLogData
}

export interface CreatePlanResponse {
  message: string
  plan: Plan
  backLog: Notify[]
}
