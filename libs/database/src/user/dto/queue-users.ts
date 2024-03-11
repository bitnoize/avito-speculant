import { User } from '../user.js'

export interface QueueUsersRequest {
  limit?: number
}

export interface QueueUsersResponse {
  message: string
  users: User[]
  limit: number
}
