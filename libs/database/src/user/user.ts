export const USER_STATUSES = ['trial', 'paid', 'block']
export type UserStatus = (typeof USER_STATUSES)[number]

export const DEFAULT_USER_LIST_ALL = false
export const DEFAULT_USER_QUEUE_LIMIT = 100

export interface User {
  id: number
  tgFromId: string
  status: UserStatus
  subscriptions: number
  categories: number
  createdAt: number
  updatedAt: number
  queuedAt: number
}
