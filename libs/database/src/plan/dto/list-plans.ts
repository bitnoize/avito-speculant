import { Plan } from '../plan.js'

export interface ListPlansRequest {
  all?: boolean
}

export interface ListPlansResponse {
  message: string
  plans: Plan[]
  all: boolean
}
