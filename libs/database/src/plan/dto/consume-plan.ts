import { Notify } from '@avito-speculant/common'
import { Plan } from '../plan.js'
import { PlanLogData } from '../../plan-log/plan-log.js'
import { DatabaseMethod } from '../../database.js'

export type ConsumePlanRequest = {
  planId: number
  data: PlanLogData
}

export type ConsumePlanResponse = {
  plan: Plan
  backLog: Notify[]
}

export type ConsumePlan = DatabaseMethod<ConsumePlanRequest, ConsumePlanResponse>
