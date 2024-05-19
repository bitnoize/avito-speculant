import { RedisMethod } from '../../redis.js'

export type DropPlanCacheRequest = {
  planId: number
}

export type DropPlanCache = RedisMethod<DropPlanCacheRequest, void>
