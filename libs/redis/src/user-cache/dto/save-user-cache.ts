import { RedisMethod } from '../../redis.js'

export type SaveUserCacheRequest = {
  userId: number
  tgFromId: string
  checkpointAt: number
}

export type SaveUserCacheResponse = void

export type SaveUserCache = RedisMethod<SaveUserCacheRequest, SaveUserCacheResponse>
