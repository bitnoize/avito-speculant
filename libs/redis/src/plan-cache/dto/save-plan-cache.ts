import { RedisMethod } from '../../redis.js'

export type SavePlanCacheRequest = {
  planId: number,
  categoriesMax: number,
  durationDays: number,
  intervalSec: number,
  analyticsOn: boolean,
  priceRub: number,
  isEnabled: boolean,
  subscriptions: number,
  createdAt: number,
  updatedAt: number,
  queuedAt: number,
}

export type SavePlanCacheResponse = void

export type SavePlanCache = RedisMethod<SavePlanCacheRequest, SavePlanCacheResponse>
