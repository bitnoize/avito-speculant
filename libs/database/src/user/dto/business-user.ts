import { Notify, User, UserLogData } from '@avito-speculant/domain'

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
