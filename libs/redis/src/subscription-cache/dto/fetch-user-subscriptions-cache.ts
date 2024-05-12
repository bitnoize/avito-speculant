import { SubscriptionCache } from '../subscription-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchUserSubscriptionsCacheRequest = {
  userId: number
}

export type FetchUserSubscriptionsCacheResponse = {
  subscriptionsCache: SubscriptionCache[]
}

export type FetchUserSubscriptionsCache = RedisMethod<
  FetchUserSubscriptionsCacheRequest,
  FetchUserSubscriptionsCacheResponse
>
