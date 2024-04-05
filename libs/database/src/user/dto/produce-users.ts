import { User } from '../user.js'
import { DatabaseMethod } from '../../database.js'

export type ProduceUsersRequest = {
  limit: number
}

export type ProduceUsersResponse = {
  users: User[]
}

export type ProduceUsers = DatabaseMethod<ProduceUsersRequest, ProduceUsersResponse>
