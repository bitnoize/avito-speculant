import { UserCache } from '../user-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchUsersCacheRequest = void

export type FetchUsersCacheResponse = {
  usersCache: UserCache[]
}

export type FetchUsersCache = RedisMethod<FetchUsersCacheRequest, FetchUsersCacheResponse>
