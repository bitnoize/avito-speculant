import { RedisMethod } from '../../redis.js'

export type SaveUserCacheRequest = {
  userId: number
  tgFromId: string
  activeSubscriptionId: number | null
  subscriptions: number
  categories: number
  bots: number
  createdAt: number
  updatedAt: number
  queuedAt: number
}

export type SaveUserCacheResponse = void

export type SaveUserCache = RedisMethod<SaveUserCacheRequest, SaveUserCacheResponse>
