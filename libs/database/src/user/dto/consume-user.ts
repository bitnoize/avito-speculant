import { Notify } from '@avito-speculant/common'
import { User } from '../user.js'
import { UserLogData } from '../../user-log/user-log.js'
import { DatabaseMethod } from '../../database.js'

export type ConsumeUserRequest = {
  entityId: number
  data: UserLogData
}

export type ConsumeUserResponse = {
  user: User
  backLog: Notify[]
}

export type ConsumeUser = DatabaseMethod<ConsumeUserRequest, ConsumeUserResponse>
