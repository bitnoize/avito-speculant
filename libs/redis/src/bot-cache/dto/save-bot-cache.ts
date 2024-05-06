import { RedisMethod } from '../../redis.js'

export type SaveLinkedBotCacheRequest = {
  botId: number
  userId: number
  token: string
  isLinked: boolean
  isEnabled: boolean
  createdAt: number
  updatedAt: number
  queuedAt: number
}

export type SaveLinkedBotCacheResponse = void

export type SaveLinkedBotCache = RedisMethod<
  SaveLinkedBotCacheRequest,
  SaveLinkedBotCacheResponse
>
