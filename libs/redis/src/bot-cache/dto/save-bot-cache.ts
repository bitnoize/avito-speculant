import { RedisMethod } from '../../redis.js'

export type SaveBotCacheRequest = {
  botId: number
  userId: number
  token: string
  isLinked: boolean
  isEnabled: boolean
  createdAt: number
  updatedAt: number
  queuedAt: number
}

export type SaveBotCache = RedisMethod<SaveBotCacheRequest, void>
