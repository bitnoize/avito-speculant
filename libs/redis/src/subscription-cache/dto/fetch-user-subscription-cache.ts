import { SubscriptionCache } from '../subscription-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchUserSubscriptionCacheRequest = {
  userId: number
  subscriptionId: number
}

export type FetchUserSubscriptionCacheResponse = {
  subscriptionCache: SubscriptionCache
}

export type FetchUserSubscriptionCache = RedisMethod<
  FetchUserSubscriptionCacheRequest,
  FetchUserSubscriptionCacheResponse
>
