import { RedisMethod } from '../../redis.js'

export type SaveSubscriptionCacheRequest = {
  subscriptionId: number
  userId: number
  planId: number
  priceRub: number
  status: string
  createdAt: number
  updatedAt: number
  queuedAt: number
  timeoutAt: number
  finishAt: number
}

export type SaveSubscriptionCache = RedisMethod<SaveSubscriptionCacheRequest, void>
