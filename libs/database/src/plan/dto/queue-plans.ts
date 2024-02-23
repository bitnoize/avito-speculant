import { Plan } from '@avito-speculant/domain'

export interface QueuePlansRequest {
  limit: number
}

export interface QueuePlansResponse {
  message: string
  statusCode: number
  plans: Plan[]
}
