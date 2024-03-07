import { UserStatus } from '../user/user.js'

export const DEFAULT_USER_LOG_LIST_LIMIT = 100

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
