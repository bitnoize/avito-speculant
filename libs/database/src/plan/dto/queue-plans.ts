import { Plan } from '../plan.js'

export interface QueuePlansRequest {
  limit?: number
}

export interface QueuePlansResponse {
  plans: Plan[]
  limit: number
}
