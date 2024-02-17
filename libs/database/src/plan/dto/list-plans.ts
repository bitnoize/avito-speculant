import { Plan } from '@avito-speculant/domain'

export interface ListPlansRequest {
  all: boolean
}

export interface ListPlansResponse {
  message: string
  statusCode: number
  plans: Plan[]
  all: boolean
}
