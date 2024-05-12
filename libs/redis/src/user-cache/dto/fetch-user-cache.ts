import { UserCache } from '../user-cache.js'
import { PlanCache } from '../../plan-cache/plan-cache.js'
import { SubscriptionCache } from '../../subscription-cache/subscription-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchUserCacheRequest = {
  userId: number
}

export type FetchUserCacheResponse = {
  userCache: UserCache
  subscriptionCache?: SubscriptionCache
  planCache?: PlanCache
}

export type FetchUserCache = RedisMethod<FetchUserCacheRequest, FetchUserCacheResponse>
