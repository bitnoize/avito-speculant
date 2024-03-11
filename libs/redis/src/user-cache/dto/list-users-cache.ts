import { UserCache } from '../user-cache.js'

export interface ListUsersCacheResponse {
  message: string
  usersCache: UserCache[]
}
