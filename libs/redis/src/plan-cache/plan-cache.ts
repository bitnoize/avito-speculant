import { REDIS_CACHE_PREFIX } from '../redis.js'

export interface PlanCache {
  id: number
  categoriesMax: number
  priceRub: number
  durationDays: number
  intervalSec: number
  analyticsOn: boolean
  time: number
}

export const planKey = (planId: number) => [REDIS_CACHE_PREFIX, 'plan', planId].join(':')

export const plansKey = () => [REDIS_CACHE_PREFIX, 'plans'].join(':')
