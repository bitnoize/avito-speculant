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
  const planCache = await planCacheRepository.fetchModel(redis, request.planId)

  return { planCache }
}

/*
 * Fetch PlanCache
 */
export async function fetchPlansCache(redis: Redis): Promise<FetchPlansCacheResponse> {
  const planIds = await planCacheRepository.fetchIndex(redis)
  const plansCache = await planCacheRepository.fetchCollection(redis, planIds)

  return { plansCache }
}

/*
 * Save PlanCache
 */
export async function savePlanCache(redis: Redis, request: SavePlanCacheRequest): Promise<void> {
  await planCacheRepository.saveModel(
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
  await planCacheRepository.dropModel(redis, request.planId)
}
