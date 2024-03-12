import { Notify } from '@avito-speculant/notify'
import { User } from '../user.js'
import { UserLogData } from '../../user-log/user-log.js'
import { Subscription } from '../../subscription/subscription.js'

export interface AuthorizeUserRequest {
  tgFromId: string
  data: UserLogData
}

export interface AuthorizeUserResponse {
  user: User
  subscription?: Subscription
  backLog: Notify[]
}
