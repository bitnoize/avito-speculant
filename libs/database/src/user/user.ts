export interface User {
  id: number
  tgFromId: string
  firstName: string
  lastName: string | null
  username: string | null
  languageCode: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserRequest {
  tgFromId: string
  firstName: string
  lastName?: string
  username?: string
  languageCode?: string
}
