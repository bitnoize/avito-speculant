import { Notify } from '@avito-speculant/common'
import { User } from '../user.js'
import { UserLogData } from '../../user-log/user-log.js'
import { Subscription } from '../../subscription/subscription.js'

export interface ConsumeUserRequest {
  userId: number
  data: UserLogData
}

export interface ConsumeUserResponse {
  user: User
  subscription: Subscription | undefined
  backLog: Notify[]
}
