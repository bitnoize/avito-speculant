import { Plan } from '../plan.js'
import { DatabaseMethod } from '../../database.js'

export type ReadPlanRequest = {
  planId: number
}

export type ReadPlanResponse = {
  plan: Plan
}

export type ReadPlan = DatabaseMethod<ReadPlanRequest, ReadPlanResponse>
