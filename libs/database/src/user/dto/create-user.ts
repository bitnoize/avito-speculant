import { Notify } from '@avito-speculant/common'
import { User } from '../user.js'
import { UserLogData } from '../../user-log/user-log.js'
import { DatabaseMethod } from '../../database.js'

export type CreateUserRequest = {
  tgFromId: string
  data: UserLogData
}

export type CreateUserResponse = {
  user: User
  backLog: Notify[]
}

export type CreateUser = DatabaseMethod<CreateUserRequest, CreateUserResponse>
