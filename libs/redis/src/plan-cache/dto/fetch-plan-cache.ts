import { PlanCache } from '../plan-cache.js'

export interface FetchPlanCacheRequest {
  planId: number
}

export interface FetchPlanCacheResponse {
  message: string
  statusCode: number
  planCache: PlanCache
}
