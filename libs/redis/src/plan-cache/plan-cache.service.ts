import { Redis } from 'ioredis'
import {
  FetchPlanCacheRequest,
  FetchPlanCacheResponse,
  FetchPlansCacheResponse,
  SavePlanCacheRequest,
  DropPlanCacheRequest
} from './dto/index.js'
import * as planCacheRepository from './plan-cache.repository.js'

/*
 * Fetch PlanCache
 */
export async function fetchPlanCache(
  redis: Redis,
  request: FetchPlanCacheRequest
): Promise<FetchPlanCacheResponse> {
  const planCache = await planCacheRepository.fetchPlanCache(redis, request.planId)

  return { planCache }
}

/*
 * Fetch PlansCache
 */
export async function fetchPlansCache(redis: Redis): Promise<FetchPlansCacheResponse> {
  const planIds = await planCacheRepository.fetchPlans(redis)
  const plansCache = await planCacheRepository.fetchPlansCache(redis, planIds)

  return { plansCache }
}

/*
 * Save PlanCache
 */
export async function savePlanCache(redis: Redis, request: SavePlanCacheRequest): Promise<void> {
  await planCacheRepository.savePlanCache(
    redis,
    request.planId,
    request.categoriesMax,
    request.priceRub,
    request.durationDays,
    request.intervalSec,
    request.analyticsOn
  )
}

/*
 * Drop PlanCache
 */
export async function dropPlanCache(redis: Redis, request: DropPlanCacheRequest): Promise<void> {
  await planCacheRepository.dropPlanCache(redis, request.planId)
}
