import { REDIS_CACHE_PREFIX } from '../redis.js'

export interface UserCache {
  id: number
  tgFromId: string
  activeSubscriptionId: number | null
  subscriptions: number
  categories: number
  bots: number
  createdAt: number
  updatedAt: number
  queuedAt: number
}

export const WEBAPP_SESSION_TIMEOUT = 3600 * 1000

export const userCacheKey = (userId: number) => [REDIS_CACHE_PREFIX, 'user-cache', userId].join(':')

export const telegramUserLinkKey = (tgFromId: string) =>
  [REDIS_CACHE_PREFIX, 'telegram-user-link', tgFromId].join(':')

export const webappUserLinkKey = (session: string) =>
  [REDIS_CACHE_PREFIX, 'webapp-user-link', session].join(':')

export const usersIndexKey = () => [REDIS_CACHE_PREFIX, 'users-index'].join(':')
