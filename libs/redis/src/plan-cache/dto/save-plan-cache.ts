import { RedisMethod } from '../../redis.js'

export type SavePlanCacheRequest = {
  planId: number
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

export type SavePlanCache = RedisMethod<SavePlanCacheRequest, void>
