import { UserStatus } from '../user/user.js'

export interface UserLog {
  id: string
  userId: number
  time: Date
  action: string
  status: UserStatus
  data: unknown
}

export interface ListUserLogsRequest {
  userId: number
}
