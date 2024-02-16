import { Plan } from '@avito-speculant/domain'

export interface ListPlansRequest {
}

export interface ListPlansResponse {
  message: string
  statusCode: number
  plans: Plan[]
}
