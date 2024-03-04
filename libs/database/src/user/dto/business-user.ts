import { User } from '../user.js'
import { UserLogData } from '../../user-log/user-log.js'
import { Notify } from '../../database.js'

export interface BusinessUserRequest {
  userId: number
  data: UserLogData
}

export interface BusinessUserResponse {
  message: string
  statusCode: number
  user: User
  backLog: Notify[]
}
