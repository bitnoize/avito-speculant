import { Notify, User, UserLog, UserLogData } from '@avito-speculant/domain'

export interface AuthorizeUserRequest {
  tgFromId: string
  data: UserLogData
}

export interface AuthorizeUserResponse {
  message: string
  statusCode: number
  user: User
  backLog: Notify[]
}
