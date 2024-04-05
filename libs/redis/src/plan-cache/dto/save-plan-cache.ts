import { RedisMethod } from '../../redis.js'

export type SavePlanCacheRequest = {
  planId: number
  categoriesMax: number
  priceRub: number
  durationDays: number
  intervalSec: number
  analyticsOn: boolean
}

export type SavePlanCacheResponse = void

export type SavePlanCache = RedisMethod<SavePlanCacheRequest, SavePlanCacheResponse>
