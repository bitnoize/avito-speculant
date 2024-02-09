export const USER_STATUSES = ['trial', 'paid', 'block']
export type UserStatus = (typeof USER_STATUSES)[number]

export type UserData = Record<string, unknown>

export interface User {
  id: number
  tgFromId: string
  status: UserStatus
  subscriptions: number
  createdAt: number
  updatedAt: number
  scheduledAt: number
}

export interface AuthorizeUserRequest {
  tgFromId: string
  data: UserData
}

export interface AuthorizeUserResponse {
  message: string
  statusCode: number
  user: User
}
