import { BotCache } from '../bot-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchBotsCacheRequest = {
  userId: number
}

export type FetchBotsCacheResponse = {
  botsCache: BotCache[]
}

export type FetchBotsCache = RedisMethod<FetchBotsCacheRequest, FetchBotsCacheResponse>
