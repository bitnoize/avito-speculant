import { RedisMethod } from '../../redis.js'

export type SaveUserCacheRequest = {
  userId: number
  tgFromId: string
  checkpoint: number
}

export type SaveUserCacheResponse = void

export type SaveUserCache = RedisMethod<SaveUserCacheRequest, SaveUserCacheResponse>
