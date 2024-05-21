import { UserCache } from '../user-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchUserCacheRequest = {
  userId: number
}

export type FetchUserCacheResponse = {
  userCache: UserCache
}

export type FetchUserCache = RedisMethod<FetchUserCacheRequest, FetchUserCacheResponse>
