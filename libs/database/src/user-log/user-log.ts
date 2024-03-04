import { UserStatus } from '../user/user.js'

export type UserLogData = Record<string, unknown>

export interface UserLog {
  id: string
  userId: number
  action: string
  status: UserStatus
  subscriptions: number
  categories: number
  data: UserLogData
  createdAt: number
}
