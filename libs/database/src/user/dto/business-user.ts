import { Notify } from '@avito-speculant/notify'
import { User } from '../user.js'
import { UserLogData } from '../../user-log/user-log.js'

export interface BusinessUserRequest {
  userId: number
  data: UserLogData
}

export interface BusinessUserResponse {
  user: User
  backLog: Notify[]
}
