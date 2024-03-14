import { Plan } from '../plan.js'

export interface ListPlansRequest {
  all?: boolean
}

export interface ListPlansResponse {
  plans: Plan[]
}
