import { SubscriptionCache } from '../subscription-cache.js'
import { PlanCache } from '../../plan-cache/plan-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchSubscriptionCacheRequest = {
  subscriptionId: number
}

export type FetchSubscriptionCacheResponse = {
  subscriptionCache: SubscriptionCache
  planCache: PlanCache
}

export type FetchSubscriptionCache = RedisMethod<
  FetchSubscriptionCacheRequest,
  FetchSubscriptionCacheResponse
>
