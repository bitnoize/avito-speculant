import { User } from '@avito-speculant/domain'

export interface StoreUserModelRequest {
  user: User
  timeout: number
}

export interface StoreUserModelResponse {
  message: string
  statusCode: number
}
