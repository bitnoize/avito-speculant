import { User } from '../user.js'

export interface ListUsersRequest {
  all?: boolean
}

export interface ListUsersResponse {
  users: User[]
}
