import { REDIS_CACHE_PREFIX } from '../redis.js'

export interface UserCache {
  id: number
  tgFromId: string
  time: number
}

export const userKey = (userId: number) => [REDIS_CACHE_PREFIX, 'user', userId].join(':')

export const usersKey = () => [REDIS_CACHE_PREFIX, 'users'].join(':')
