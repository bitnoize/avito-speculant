import { RedisMethod } from '../../redis.js'

export type SaveWebappUserIdRequest = {
  token: string
  userId: number
}

export type SaveWebappUserCacheResponse = void

export type SaveWebappUserCache = RedisMethod<
  SaveWebappUserCacheRequest,
  SaveWebappUserCacheResponse
>
