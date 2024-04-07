import { RedisMethod } from '../../redis.js'

export type RenewUserCacheRequest = {
  userId: number
  checkpointAt: number
}

export type RenewUserCacheResponse = void

export type RenewUserCache = RedisMethod<RenewUserCacheRequest, RenewUserCacheResponse>
