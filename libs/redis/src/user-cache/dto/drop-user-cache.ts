import { RedisMethod } from '../../redis.js'

export type DropUserCacheRequest = {
  userId: number
  tgFromId: string
}

export type DropUserCacheResponse = void

export type DropUserCache = RedisMethod<
  DropUserCacheRequest,
  DropUserCacheResponse
>
