import { REDIS_CACHE_PREFIX } from '../redis.js'

export interface BotCache {
  id: number
  userId: number
  token: string
  isLinked: boolean
  isEnabled: boolean
  isOnline: boolean
  tgFromId: string | null
  username: string | null
  totalCount: number
  successCount: number
  createdAt: number
  updatedAt: number
  queuedAt: number
}

export const botCacheKey = (botId: number) => [REDIS_CACHE_PREFIX, 'bot-cache', botId].join(':')

export const userBotsIndexKey = (userId: number) =>
  [REDIS_CACHE_PREFIX, 'user-bots-index', userId].join(':')
