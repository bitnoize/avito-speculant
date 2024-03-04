import { Redis } from 'ioredis'
import { SavePlanCacheRequest, SavePlanCacheResponse } from './dto/save-plan-cache.js'
import { FetchPlanCacheRequest, FetchPlanCacheResponse } from './dto/fetch-plan-cache.js'
import { DropPlanCacheRequest, DropPlanCacheResponse } from './dto/drop-plan-cache.js'
import { ListPlansCacheResponse } from './dto/list-plans-cache.js'
import * as planCacheRepository from './plan-cache.repository.js'

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
    request.analyticsOn,
    request.timeout
  )

  return {
    message: `PlanCache successfully saved`,
    statusCode: 200
  }
}

export async function fetchPlanCache(
  redis: Redis,
  request: FetchPlanCacheRequest
): Promise<FetchPlanCacheResponse> {
  const planCache = await planCacheRepository.fetchModel(redis, request.planId)

  return {
    message: `PlanCache successfully fetched`,
    statusCode: 200,
    planCache
  }
}

export async function dropPlanCache(
  redis: Redis,
  request: DropPlanCacheRequest
): Promise<DropPlanCacheResponse> {
  await planCacheRepository.dropModel(redis, request.planId)

  return {
    message: `PlanCache successfully dropped`,
    statusCode: 200
  }
}

export async function listPlansCache(redis: Redis): Promise<ListPlansCacheResponse> {
  const planIds = await planCacheRepository.fetchIndex(redis)
  const plansCache = await planCacheRepository.fetchCollection(redis, planIds)

  return {
    message: `PlansCache successfully listed`,
    statusCode: 200,
    plansCache
  }
}
