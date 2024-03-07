export interface DropPlanCacheRequest {
  planId: number
  timeout: number
}

export interface DropPlanCacheResponse {
  message: string
  statusCode: number
}
