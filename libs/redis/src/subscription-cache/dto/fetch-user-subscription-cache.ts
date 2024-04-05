import { SubscriptionCache } from '../subscription-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchUserSubscriptionCacheRequest = {
  userId: number
}

export type FetchUserSubscriptionCacheResponse = {
  subscriptionCache: SubscriptionCache | undefined
}

export type FetchUserSubscriptionCache = RedisMethod<
  FetchUserSubscriptionCacheRequest,
  FetchUserSubscriptionCacheResponse
>
