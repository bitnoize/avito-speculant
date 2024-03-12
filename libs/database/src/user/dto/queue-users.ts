import { User } from '../user.js'

export interface QueueUsersRequest {
  limit?: number
}

export interface QueueUsersResponse {
  users: User[]
  limit: number
}
