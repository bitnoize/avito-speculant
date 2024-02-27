import { User } from '@avito-speculant/domain'

export interface FetchUserModelRequest {
  userId: number
  force: boolean
}

export interface FetchUserModelResponse {
  message: string
  statusCode: number
  user: User | undefined
}
