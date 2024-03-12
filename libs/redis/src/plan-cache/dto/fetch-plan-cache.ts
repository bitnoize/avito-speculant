import { PlanCache } from '../plan-cache.js'

export interface FetchPlanCacheRequest {
  planId: number
}

export interface FetchPlanCacheResponse {
  planCache: PlanCache
}
