import { REDIS_CACHE_PREFIX } from '../redis.js'

export interface BotCache {
  id: number
  userId: number
  token: string
  isLinked: boolean
  isEnabled: boolean
  createdAt: number
  updatedAt: number
  queuedAt: number
}

export const botCacheKey = (botId: number) => [REDIS_CACHE_PREFIX, 'bot', botId].join(':')

export const userBotsIndexKey = () => [REDIS_CACHE_PREFIX, 'user-bots'].join(':')

export const userOnlineBotsKey = () => [REDIS_CACHE_PREFIX, 'user-online-bots'].join(':')
