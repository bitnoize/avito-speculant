import { SubscriptionCache } from '../subscription-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchPlanSubscriptionsCacheRequest = {
  planId: number
}

export type FetchPlanSubscriptionsCacheResponse = {
  subscriptionsCache: SubscriptionCache[]
}

export type FetchPlanSubscriptionsCache = RedisMethod<
  FetchPlanSubscriptionsCacheRequest,
  FetchPlanSubscriptionsCacheResponse
>
