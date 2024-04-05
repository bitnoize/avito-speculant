import { RedisMethod } from '../../redis.js'

export type DropSubscriptionCacheRequest = {
  subscriptionId: number
  userId: number
  planId: number
}

export type DropSubscriptionCacheResponse = void

export type DropSubscriptionCache = RedisMethod<
  DropSubscriptionCacheRequest,
  DropSubscriptionCacheResponse
>
