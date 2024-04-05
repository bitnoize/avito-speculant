import {
  FetchSubscriptionCache,
  FetchUserSubscriptionCache,
  FetchPlanSubscriptionsCache,
  SaveSubscriptionCache,
  DropSubscriptionCache
} from './dto/index.js'
import { UserSubscriptionError } from './subscription-cache.errors.js'
import * as subscriptionCacheRepository from './subscription-cache.repository.js'

/*
 * Fetch SubscriptionCache
 */
export const fetchSubscriptionCache: FetchSubscriptionCache = async function(redis, request) {
  const subscriptionCache = await subscriptionCacheRepository.fetchSubscriptionCache(
    redis,
    request.subscriptionId
  )

  return { subscriptionCache }
}

/*
 * Fetch UserSubscriptionCache
 */
export const fetchUserSubscriptionCache: FetchUserSubscriptionCache = async function(redis, request) {
  const subscriptionIds = await subscriptionCacheRepository.fetchUserSubscriptions(
    redis,
    request.userId
  )

  if (subscriptionIds.length === 0) {
    return {
      subscriptionCache: undefined
    }
  }

  if (subscriptionIds.length !== 1) {
    throw new UserSubscriptionError({ request })
  }

  const subscriptionCache = await subscriptionCacheRepository.fetchSubscriptionCache(
    redis,
    subscriptionIds[0]
  )

  return { subscriptionCache }
}

/*
 * Fetch PlanSubscriptionsCache
 */
export const fetchPlanSubscriptionsCache: FetchPlanSubscriptionsCache = async function(redis, request) {
  const subscriptionIds = await subscriptionCacheRepository.fetchPlanSubscriptions(
    redis,
    request.planId
  )
  const subscriptionsCache = await subscriptionCacheRepository.fetchSubscriptionsCache(
    redis,
    subscriptionIds
  )

  return { subscriptionsCache }
}

/*
 * Save SubscriptionCache
 */
export const saveSubscriptionCache: SaveSubscriptionCache = async function(redis, request) {
  await subscriptionCacheRepository.saveSubscriptionCache(
    redis,
    request.subscriptionId,
    request.userId,
    request.planId,
    request.categoriesMax,
    request.priceRub,
    request.durationDays,
    request.intervalSec,
    request.analyticsOn
  )
}

/*
 * Drop SubscriptionCache
 */
export const dropSubscriptionCache: DropSubscriptionCache = async function(redis, request) {
  await subscriptionCacheRepository.dropSubscriptionCache(
    redis,
    request.subscriptionId,
    request.userId,
    request.planId
  )
}
