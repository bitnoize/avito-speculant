import { SubscriptionCacheStatus } from '../../subscription-cache/subscription-cache.js'
import { RedisMethod } from '../../redis.js'

export type SavePaidUserCacheRequest = {
  userId: number
  userTgFromId: string
  userIsPaid: boolean
  userSubscriptionId: number,
  userSubscriptions: number
  userCategories: number
  userBots: number
  userCreatedAt: number
  userUpdatedAt: number
  userQueuedAt: number
  planId: number,
  planCategoriesMax: number,
  planDurationDays: number,
  planIntervalSec: number,
  planAnalyticsOn: boolean,
  planPriceRub: number,
  planIsEnabled: boolean,
  planSubscriptions: number,
  planCreatedAt: number,
  planUpdatedAt: number,
  planQueuedAt: number,
  subscriptionId: number,
  subscriptionPriceRub: number,
  subscriptionStatus: SubscriptionCacheStatus,
  subscriptionCreatedAt: number,
  subscriptionUpdatedAt: number,
  subscriptionQueuedAt: number,
  subscriptionTimeoutAt: number,
  subscriptionFinishAt: number
}

export type SavePaidUserCacheResponse = void

export type SavePaidUserCache = RedisMethod<
  SavePaidUserCacheRequest,
  SavePaidUserCacheResponse
>
