import { SubscriptionCache } from '../subscription-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchSubscriptionCacheRequest = {
  subscriptionId: number
}

export type FetchSubscriptionCacheResponse = {
  subscriptionCache: SubscriptionCache
}

export type FetchSubscriptionCache = RedisMethod<
  FetchSubscriptionCacheRequest,
  FetchSubscriptionCacheResponse
>
