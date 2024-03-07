import { Plan } from '../plan.js'

export interface ListPlansRequest {
  all?: boolean
}

export interface ListPlansResponse {
  message: string
  statusCode: number
  plans: Plan[]
  all: boolean
}
