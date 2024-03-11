import { PlanCache } from '../plan-cache.js'

export interface ListPlansCacheResponse {
  message: string
  plansCache: PlanCache[]
}
