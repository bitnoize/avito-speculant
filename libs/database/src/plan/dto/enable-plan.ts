import { Notify } from '@avito-speculant/common'
import { Plan } from '../plan.js'
import { PlanLogData } from '../../plan-log/plan-log.js'
import { DatabaseMethod } from '../../database.js'

export type EnablePlanRequest = {
  planId: number
  data: PlanLogData
}

export type EnablePlanResponse = {
  plan: Plan
  backLog: Notify[]
}

export type EnablePlan = DatabaseMethod<EnablePlanRequest, EnablePlanResponse>
