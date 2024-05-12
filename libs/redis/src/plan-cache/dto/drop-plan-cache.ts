import { RedisMethod } from '../../redis.js'

export type DropPlanCacheRequest = {
  planId: number,
}

export type DropPlanCacheResponse = void

export type DropPlanCache = RedisMethod<DropPlanCacheRequest, DropPlanCacheResponse>
