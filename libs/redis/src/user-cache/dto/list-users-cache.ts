import { UserCache } from '../user-cache.js'

export interface ListUsersCacheResponse {
  message: string
  statusCode: number
  usersCache: UserCache[]
}
