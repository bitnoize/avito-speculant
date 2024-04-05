import { Notify } from '@avito-speculant/common'
import { Plan } from '../plan.js'
import { PlanLogData } from '../../plan-log/plan-log.js'
import { DatabaseMethod } from '../../database.js'

export type DisablePlanRequest = {
  planId: number
  data: PlanLogData
}

export type DisablePlanResponse = {
  plan: Plan
  backLog: Notify[]
}

export type DisablePlan = DatabaseMethod<DisablePlanRequest, DisablePlanResponse>
