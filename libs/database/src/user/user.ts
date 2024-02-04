export const UserStatuses = ['free', 'paid', 'hold']
export const UserDefaultStatus = UserStatuses[0]
export type UserStatus = (typeof UserStatuses)[number]

export interface User {
  id: number
  tgFromId: string
  status: UserStatus
  createdAt: Date
  updatedAt: Date
}

export interface AuthorizeUserRequest {
  tgFromId: string
  data: unknown
}
