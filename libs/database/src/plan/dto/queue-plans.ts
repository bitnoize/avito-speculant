import { Plan } from '../plan.js'

export interface QueuePlansRequest {
  limit?: number
}

export interface QueuePlansResponse {
  message: string
  plans: Plan[]
  limit: number
}
