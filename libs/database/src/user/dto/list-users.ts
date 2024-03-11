import { User } from '../user.js'

export interface ListUsersRequest {
  all?: boolean
}

export interface ListUsersResponse {
  message: string
  users: User[]
  all: boolean
}
