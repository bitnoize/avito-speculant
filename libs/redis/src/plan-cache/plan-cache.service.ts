import { FetchPlanCache, FetchPlansCache, SavePlanCache, DropPlanCache } from './dto/index.js'
import { PlanCacheNotFoundError } from './plan-cache.errors.js'
import * as planCacheRepository from './plan-cache.repository.js'

/*
 * Fetch PlanCache
 */
export const fetchPlanCache: FetchPlanCache = async function (redis, request) {
  const planCache = await planCacheRepository.fetchPlanCache(redis, request.planId)

  if (planCache === undefined) {
    throw new PlanCacheNotFoundError({ request })
  }

  return { planCache }
}

/*
 * Fetch PlansCache
 */
export const fetchPlansCache: FetchPlansCache = async function (redis) {
  const planIds = await planCacheRepository.fetchPlansIndex(redis)
  const plansCache = await planCacheRepository.fetchPlansCache(redis, planIds)

  return { plansCache }
}

/*
 * Save PlanCache
 */
export const savePlanCache: SavePlanCache = async function (redis, request) {
  await planCacheRepository.savePlanCache(
    redis,
    request.planId,
    request.categoriesMax,
    request.durationDays,
    request.intervalSec,
    request.analyticsOn,
    request.priceRub,
    request.isEnabled,
    request.subscriptions,
    request.createdAt,
    request.updatedAt,
    request.queuedAt
  )
}

/*
 * Drop PlanCache
 */
export const dropPlanCache: DropPlanCache = async function (redis, request) {
  await planCacheRepository.dropPlanCache(redis, request.planId)
}
