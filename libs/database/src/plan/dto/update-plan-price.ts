import { Notify } from '@avito-speculant/common'
import { Plan } from '../plan.js'
import { PlanLogData } from '../../plan-log/plan-log.js'
import { DatabaseMethod } from '../../database.js'

export type UpdatePlanPriceRequest = {
  planId: number
  priceRub: number
  data: PlanLogData
}

export type UpdatePlanPriceResponse = {
  plan: Plan
  backLog: Notify[]
}

export type UpdatePlanPrice = DatabaseMethod<UpdatePlanPriceRequest, UpdatePlanPriceResponse>
