export type UserLogData = Record<string, unknown>

export interface UserLog {
  id: string
  userId: number
  action: string
  isPaid: boolean
  subscriptions: number
  categories: number
  bots: number
  data: UserLogData
  createdAt: number
}
