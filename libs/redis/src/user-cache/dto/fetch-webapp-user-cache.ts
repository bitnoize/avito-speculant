import { UserCache } from '../user-cache.js'
import { PlanCache } from '../../plan-cache/plan-cache.js'
import { SubscriptionCache } from '../../subscription-cache/subscription-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchWebappUserCacheRequest = {
  token: string
}

export type FetchWebappUserCacheResponse = {
  userCache: UserCache
  subscriptionCache: SubscriptionCache | undefined
  planCache: PlanCache | undefined
}

export type FetchWebappUserCache = RedisMethod<
  FetchWebappUserCacheRequest,
  FetchWebappUserCacheResponse
>
