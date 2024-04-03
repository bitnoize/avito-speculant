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
  time: number
}

export const subscriptionKey = (subscriptionId: number) =>
  [REDIS_CACHE_PREFIX, 'subscription', subscriptionId].join(':')

export const userSubscriptionsKey = (userId: number) =>
  [REDIS_CACHE_PREFIX, 'user-subscriptions', userId].join(':')

export const planSubscriptionsKey = (planId: number) =>
  [REDIS_CACHE_PREFIX, 'plan-subscriptions', planId].join(':')
