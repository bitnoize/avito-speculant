import { BotCache } from '../bot-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchUserBotCacheRequest = {
  userId: number
  botId: number
}

export type FetchUserBotCacheResponse = {
  botCache: BotCache
}

export type FetchUserBotCache = RedisMethod<FetchUserBotCacheRequest, FetchUserBotCacheResponse>
