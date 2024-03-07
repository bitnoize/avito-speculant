import { REDIS_CACHE_PREFIX } from '../redis.js'

export interface UserCache {
  id: number
  tgFromId: string
}

export const userCacheKey = (userId: number) => [REDIS_CACHE_PREFIX, 'user', userId].join(':')

export const usersCacheKey = () => [REDIS_CACHE_PREFIX, 'users'].join(':')
