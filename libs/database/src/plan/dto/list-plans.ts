import { Plan } from '../plan.js'
import { DatabaseMethod } from '../../database.js'

export type ListPlansRequest = {
  all?: boolean
}

export type ListPlansResponse = {
  plans: Plan[]
}

export type ListPlans = DatabaseMethod<ListPlansRequest, ListPlansResponse>
