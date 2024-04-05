import { RedisMethod } from '../../redis.js'

export type RenewUserCacheRequest = {
  userId: number
  checkpoint: number
}

export type RenewUserCacheResponse = void

export type RenewUserCache = RedisMethod<RenewUserCacheRequest, RenewUserCacheResponse>
