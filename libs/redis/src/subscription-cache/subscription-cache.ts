import { REDIS_CACHE_PREFIX } from '../redis.js'

export const SUBSCRIPTION_CACHE_STATUSES = ['wait', 'active', 'finish']
export type SubscriptionCacheStatus = (typeof SUBSCRIPTION_CACHE_STATUSES)[number]

export interface SubscriptionCache {
  id: number
  userId: number
  planId: number
  priceRub: number
  status: SubscriptionCacheStatus
  createdAt: number
  updatedAt: number
  queuedAt: number
  timeoutAt: number
  finishAt: number
}

export const subscriptionKey = (subscriptionId: number) =>
  [REDIS_CACHE_PREFIX, 'subscription', subscriptionId].join(':')

export const userSubscriptionsKey = (userId: number) =>
  [REDIS_CACHE_PREFIX, 'user-subscriptions', userId].join(':')

export const userActiveSubscriptionKey = (userId: number) =>
  [REDIS_CACHE_PREFIX, 'user-active-subscription', userId].join(':')

export const planSubscriptionsKey = (planId: number) =>
  [REDIS_CACHE_PREFIX, 'plan-subscriptions', planId].join(':')
