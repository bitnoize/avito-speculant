export interface User {
  id: number
  tgFromId: string
  activeSubscriptionId: number | null
  subscriptions: number
  categories: number
  bots: number
  createdAt: number
  updatedAt: number
  queuedAt: number
}

export const USER_PRODUCE_AFTER = '1 minute'
