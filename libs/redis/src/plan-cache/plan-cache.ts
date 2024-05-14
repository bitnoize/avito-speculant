import { REDIS_CACHE_PREFIX } from '../redis.js'

export interface PlanCache {
  id: number
  categoriesMax: number
  durationDays: number
  intervalSec: number
  analyticsOn: boolean
  priceRub: number
  isEnabled: boolean
  subscriptions: number
  createdAt: number
  updatedAt: number
  queuedAt: number
}

export const planCacheKey = (planId: number) => [REDIS_CACHE_PREFIX, 'plan_cache', planId].join(':')

export const plansIndexKey = () => [REDIS_CACHE_PREFIX, 'plans_index'].join(':')
