export const USER_STATUSES = ['blank', 'paid', 'block']
export type UserStatus = (typeof USER_STATUSES)[number]

export type UserData = Record<string, unknown>

export interface User {
  id: number
  tgFromId: string
  status: UserStatus
  subscriptions: number
  createTime: Date
  updateTime: Date
  processTime: Date
}

export interface AuthorizeUserRequest {
  tgFromId: string
  data: UserData
}

export interface AuthorizeUserResponse {
  user: User
}
