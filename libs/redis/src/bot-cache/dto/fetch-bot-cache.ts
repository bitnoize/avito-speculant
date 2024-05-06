import { BotCache } from '../bot-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchBotCacheRequest = {
  botId: number
}

export type FetchBotCacheResponse = {
  botCache: BotCache
}

export type FetchBotCache = RedisMethod<FetchBotCacheRequest, FetchBotCacheResponse>
