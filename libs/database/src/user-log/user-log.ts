import { User, UserStatus, UserData } from '../user/user.js'

export interface UserLog {
  id: string
  userId: number
  time: Date
  action: string
  status: UserStatus
  subscriptions: number
  data: UserData
}

export interface ListUserLogsRequest {
  userId: number
  limit: number
}

export interface ListUserLogsResponse {
  message: string
  statusCode: number
  user: User
  userLogs: UserLog[]
  limit: number
}
