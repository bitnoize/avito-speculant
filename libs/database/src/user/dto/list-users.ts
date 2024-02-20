import { User } from '@avito-speculant/domain'

export interface ListUsersRequest {
  all: boolean
}

export interface ListUsersResponse {
  message: string
  statusCode: number
  users: User[]
  all: boolean
}
