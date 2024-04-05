import { Notify } from '@avito-speculant/common'
import { Plan } from '../plan.js'
import { PlanLogData } from '../../plan-log/plan-log.js'
import { DatabaseMethod } from '../../database.js'

export type UpdatePlanRequest = {
  planId: number
  categoriesMax?: number
  priceRub?: number
  durationDays?: number
  intervalSec?: number
  analyticsOn?: boolean
  data: PlanLogData
}

export type UpdatePlanResponse = {
  plan: Plan
  backLog: Notify[]
}

export type UpdatePlan = DatabaseMethod<UpdatePlanRequest, UpdatePlanResponse>
