import { UserStatus, UserData } from '../user/user.js'

export interface UserLog {
  id: string
  userId: number
  action: string
  status: UserStatus
  subscriptions: number
  data: UserData
  createdAt: number
}

export interface ListUserLogsRequest {
  userId: number
  limit: number
}

export interface ListUserLogsResponse {
  message: string
  statusCode: number
  userLogs: UserLog[]
  limit: number
}
