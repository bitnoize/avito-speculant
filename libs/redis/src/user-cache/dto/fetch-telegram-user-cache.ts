import { UserCache } from '../user-cache.js'
import { PlanCache } from '../../plan-cache/plan-cache.js'
import { SubscriptionCache } from '../../subscription-cache/subscription-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchTelegramUserCacheRequest = {
  tgFromId: string
}

export type FetchTelegramUserCacheResponse = {
  userCache: UserCache
  subscriptionCache: SubscriptionCache | undefined
  planCache: PlanCache | undefined
}

export type FetchTelegramUserCache = RedisMethod<
  FetchTelegramUserCacheRequest,
  FetchTelegramUserCacheResponse
>
