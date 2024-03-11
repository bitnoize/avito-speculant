import { Redis } from 'ioredis'
import {
  FetchPlanCacheRequest,
  FetchPlanCacheResponse,
  ListPlansCacheResponse,
  SavePlanCacheRequest,
  SavePlanCacheResponse,
  DropPlanCacheRequest,
  DropPlanCacheResponse
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

  return {
    message: `PlanCache successfully fetched`,
    planCache
  }
}

/*
 * List PlanCache
 */
export async function listPlansCache(redis: Redis): Promise<ListPlansCacheResponse> {
  const planIds = await planCacheRepository.fetchIndex(redis)
  const plansCache = await planCacheRepository.fetchCollection(redis, planIds)

  return {
    message: `PlansCache successfully listed`,
    plansCache
  }
}

/*
 * Save PlanCache
 */
export async function savePlanCache(
  redis: Redis,
  request: SavePlanCacheRequest
): Promise<SavePlanCacheResponse> {
  await planCacheRepository.saveModel(
    redis,
    request.planId,
    request.categoriesMax,
    request.priceRub,
    request.durationDays,
    request.intervalSec,
    request.analyticsOn
  )

  return {
    message: `PlanCache successfully saved`,
  }
}

/*
 * Drop PlanCache
 */
export async function dropPlanCache(
  redis: Redis,
  request: DropPlanCacheRequest
): Promise<DropPlanCacheResponse> {
  await planCacheRepository.dropModel(redis, request.planId)

  return {
    message: `PlanCache successfully dropped`,
  }
}
