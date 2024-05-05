import { User } from '../user.js'
import { DatabaseMethod } from '../../database.js'

export type ListUsersRequest = void

export type ListUsersResponse = {
  users: User[]
}

export type ListUsers = DatabaseMethod<ListUsersRequest, ListUsersResponse>
