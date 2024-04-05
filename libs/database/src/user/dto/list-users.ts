import { User } from '../user.js'
import { DatabaseMethod } from '../../database.js'

export type ListUsersRequest = {
  all?: boolean
}

export type ListUsersResponse = {
  users: User[]
}

export type ListUsers = DatabaseMethod<ListUsersRequest, ListUsersResponse>
