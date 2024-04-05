import { Notify } from '@avito-speculant/common'
import { Plan } from '../plan.js'
import { PlanLogData } from '../../plan-log/plan-log.js'
import { DatabaseMethod } from '../../database.js'

export type CreatePlanRequest = {
  categoriesMax: number
  priceRub: number
  durationDays: number
  intervalSec: number
  analyticsOn: boolean
  data: PlanLogData
}

export type CreatePlanResponse = {
  plan: Plan
  backLog: Notify[]
}

export type CreatePlan = DatabaseMethod<CreatePlanRequest, CreatePlanResponse>
