import { Notify } from '@avito-speculant/notify'
import { User } from '../user.js'
import { UserLogData } from '../../user-log/user-log.js'

export interface ConsumeUserRequest {
  userId: number
  data: UserLogData
}

export interface ConsumeUserResponse {
  user: User
  backLog: Notify[]
}
