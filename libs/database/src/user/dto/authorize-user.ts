import { Notify, User, Subscription, UserLogData } from '@avito-speculant/domain'

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
