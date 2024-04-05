import { PlanCache } from '../plan-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchPlanCacheRequest = {
  planId: number
}

export type FetchPlanCacheResponse = {
  planCache: PlanCache
}

export type FetchPlanCache = RedisMethod<FetchPlanCacheRequest, FetchPlanCacheResponse>
