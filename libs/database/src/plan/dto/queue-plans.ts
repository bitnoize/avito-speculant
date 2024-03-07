import { Plan } from '../plan.js'

export interface QueuePlansRequest {
  limit?: number
}

export interface QueuePlansResponse {
  message: string
  statusCode: number
  plans: Plan[]
  limit: number
}
