import { PlanCache } from '../plan-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchPlansCacheRequest = undefined

export type FetchPlansCacheResponse = {
  plansCache: PlanCache[]
}

export type FetchPlansCache = RedisMethod<FetchPlansCacheRequest, FetchPlansCacheResponse>
