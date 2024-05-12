export type UserLogData = Record<string, unknown>

export interface UserLog {
  id: string
  userId: number
  action: string
  activeSubscriptionId: number | null
  subscriptions: number
  categories: number
  bots: number
  data: UserLogData
  createdAt: number
}
