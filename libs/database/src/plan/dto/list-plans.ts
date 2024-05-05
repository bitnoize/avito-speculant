import { Plan } from '../plan.js'
import { DatabaseMethod } from '../../database.js'

export type ListPlansRequest = void

export type ListPlansResponse = {
  plans: Plan[]
}

export type ListPlans = DatabaseMethod<ListPlansRequest, ListPlansResponse>
