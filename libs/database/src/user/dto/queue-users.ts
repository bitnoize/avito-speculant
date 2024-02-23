import { User } from '@avito-speculant/domain'

export interface QueueUsersRequest {
  limit: number
}

export interface QueueUsersResponse {
  message: string
  statusCode: number
  users: User[]
}
