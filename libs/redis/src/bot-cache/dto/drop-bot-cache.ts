import { RedisMethod } from '../../redis.js'

export type DropBotCacheRequest = {
  botId: number
  userId: number
}

export type DropBotCacheResponse = void

export type DropBotCache = RedisMethod<DropBotCacheRequest, DropBotCacheResponse>
