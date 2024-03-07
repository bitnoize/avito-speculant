import { REDIS_CACHE_PREFIX } from '../redis.js'

export interface SubscriptionCache {
  id: number
  userId: number
  planId: number
  categoriesMax: number
  priceRub: number
  durationDays: number
  intervalSec: number
  analyticsOn: boolean
}

export const subscriptionCacheKey = (subscriptionId: number) =>
  [REDIS_CACHE_PREFIX, 'subscription', subscriptionId].join(':')

export const userSubscriptionCacheKey = (userId: number) =>
  [REDIS_CACHE_PREFIX, 'user-subscription', userId].join(':')

export const planSubscriptionsCacheKey = (planId: number) =>
  [REDIS_CACHE_PREFIX, 'plan-subscriptions', planId].join(':')
