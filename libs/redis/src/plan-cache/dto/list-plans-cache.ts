import { PlanCache } from '../plan-cache.js'

export interface ListPlansCacheResponse {
  message: string
  statusCode: number
  plansCache: PlanCache[]
}
