import { BotCache } from '../bot-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchUserBotsCacheRequest = {
  userId: number
}

export type FetchUserBotsCacheResponse = {
  botsCache: BotCache[]
}

export type FetchUserBotsCache = RedisMethod<FetchUserBotsCacheRequest, FetchUserBotsCacheResponse>
