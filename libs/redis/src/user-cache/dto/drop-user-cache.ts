import { RedisMethod } from '../../redis.js'

export type DropUserCacheRequest = {
  userId: number
}

export type DropUserCacheResponse = void

export type DropUserCache = RedisMethod<DropUserCacheRequest, DropUserCacheResponse>
