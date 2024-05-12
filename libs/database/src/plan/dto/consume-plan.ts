import { Plan } from '../plan.js'
import { PlanLogData } from '../../plan-log/plan-log.js'
import { DatabaseMethod } from '../../database.js'

export type ConsumePlanRequest = {
  entityId: number
  data: PlanLogData
}

export type ConsumePlanResponse = {
  plan: Plan
}

export type ConsumePlan = DatabaseMethod<ConsumePlanRequest, ConsumePlanResponse>
