import { REDIS_CACHE_PREFIX } from '../redis.js'

export interface UserCache {
  id: number
  tgFromId: string
  isPaid: boolean
  subscriptionId: number | null
  subscriptions: number
  categories: number
  bots: number
  createdAt: number
  updatedAt: number
  queuedAt: number
}

export const WEBAPP_USER_ID_TIMEOUT = 3600 * 1000

export const userCacheKey = (userId: number) => [REDIS_CACHE_PREFIX, 'user', userId].join(':')

export const telegramUserIdKey = (tgFromId: string) =>
  [REDIS_CACHE_PREFIX, 'telegram-user_id', tgFromId].join(':')

export const webappUserIdKey = (token: string) =>
  [REDIS_CACHE_PREFIX, 'webapp-user_id', token].join(':')

export const usersIndexKey = () => [REDIS_CACHE_PREFIX, 'users'].join(':')
