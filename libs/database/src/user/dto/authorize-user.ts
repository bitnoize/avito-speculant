import { User } from '../user.js'
import { UserLogData } from '../../user-log/user-log.js'
import { Subscription } from '../../subscription/subscription.js'
import { Notify } from '../../database.js'

export interface AuthorizeUserRequest {
  tgFromId: string
  data: UserLogData
}

export interface AuthorizeUserResponse {
  message: string
  statusCode: number
  user: User
  subscription?: Subscription
  backLog: Notify[]
}
