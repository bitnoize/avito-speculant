import { PlanCache } from '../plan-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchPlansCacheResponse = {
  plansCache: PlanCache[]
}

export type FetchPlansCache = RedisMethod<void, FetchPlansCacheResponse>
