import { User } from '../user.js'

export interface QueueUsersRequest {
  limit: number
}

export interface QueueUsersResponse {
  message: string
  statusCode: number
  users: User[]
}
