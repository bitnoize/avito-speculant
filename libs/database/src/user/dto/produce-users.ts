import { User } from '../user.js'

export interface ProduceUsersRequest {
  limit?: number
}

export interface ProduceUsersResponse {
  users: User[]
}
