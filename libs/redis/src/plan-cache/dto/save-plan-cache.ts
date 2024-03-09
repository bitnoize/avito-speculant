export interface SavePlanCacheRequest {
  planId: number
  categoriesMax: number
  priceRub: number
  durationDays: number
  intervalSec: number
  analyticsOn: boolean
}

export interface SavePlanCacheResponse {
  message: string
  statusCode: number
}
