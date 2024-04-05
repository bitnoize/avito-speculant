import { Plan } from '../plan.js'
import { DatabaseMethod } from '../../database.js'

export type ProducePlansRequest = {
  limit: number
}

export type ProducePlansResponse = {
  plans: Plan[]
}

export type ProducePlans = DatabaseMethod<ProducePlansRequest, ProducePlansResponse>
