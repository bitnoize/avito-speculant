import { REDIS_CACHE_PREFIX } from '../redis.js'

export interface SubscriptionCache {
  id: number
  userId: number
  planId: number
  priceRub: number
  status: string
  createdAt: number
  updatedAt: number
  queuedAt: number
  timeoutAt: number
  finishAt: number
}

export const subscriptionCacheKey = (subscriptionId: number) =>
  [REDIS_CACHE_PREFIX, 'subscription-cache', subscriptionId].join(':')

//export const userActiveSubscriptionLinkKey = (userId: number) =>
//  [REDIS_CACHE_PREFIX, 'user-active_subscription-link', userId].join(':')

export const userSubscriptionsIndexKey = (userId: number) =>
  [REDIS_CACHE_PREFIX, 'user-subscriptions-index', userId].join(':')
