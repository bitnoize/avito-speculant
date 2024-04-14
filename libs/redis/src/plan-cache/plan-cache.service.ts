import { FetchPlanCache, FetchPlansCache, SavePlanCache, DropPlanCache } from './dto/index.js'
import * as planCacheRepository from './plan-cache.repository.js'

/*
 * Fetch PlanCache
 */
export const fetchPlanCache: FetchPlanCache = async function (redis, request) {
  const planCache = await planCacheRepository.fetchPlanCache(redis, request.planId)

  return { planCache }
}

/*
 * Fetch PlansCache
 */
export const fetchPlansCache: FetchPlansCache = async function (redis) {
  const planIds = await planCacheRepository.fetchPlans(redis)
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
    request.priceRub,
    request.durationDays,
    request.intervalSec,
    request.analyticsOn
  )
}

/*
 * Drop PlanCache
 */
export const dropPlanCache: DropPlanCache = async function (redis, request) {
  await planCacheRepository.dropPlanCache(redis, request.planId)
}
