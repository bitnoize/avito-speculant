export const USER_STATUSES = ['trial', 'paid', 'block']
export type UserStatus = (typeof USER_STATUSES)[number]

export interface User {
  id: number
  tgFromId: string
  status: UserStatus
  subscriptions: number
  createdAt: number
  updatedAt: number
  scheduledAt: number
}
