import { BotCache } from '../bot-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchOnlineBotsCacheRequest = {
  userId: number
}

export type FetchOnlineBotsCacheResponse = {
  botsCache: BotCache[]
}

export type FetchOnlineBotsCache = RedisMethod<
  FetchOnlineBotsCacheRequest,
  FetchOnlineBotsCacheResponse
>
