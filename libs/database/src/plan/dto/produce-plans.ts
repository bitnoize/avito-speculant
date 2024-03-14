import { Plan } from '../plan.js'

export interface ProducePlansRequest {
  limit?: number
}

export interface ProducePlansResponse {
  plans: Plan[]
}
