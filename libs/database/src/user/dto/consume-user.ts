import { Notify } from '@avito-speculant/common'
import { User } from '../user.js'
import { UserLogData } from '../../user-log/user-log.js'
import { Subscription } from '../../subscription/subscription.js'
import { DatabaseMethod } from '../../database.js'

export type ConsumeUserRequest = {
  userId: number
  data: UserLogData
}

export type ConsumeUserResponse = {
  user: User
  subscription: Subscription | undefined
  backLog: Notify[]
}

export type ConsumeUser = DatabaseMethod<ConsumeUserRequest, ConsumeUserResponse>
