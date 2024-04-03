import { Redis } from 'ioredis'
import {
  FetchSubscriptionCacheRequest,
  FetchSubscriptionCacheResponse,
  FetchUserSubscriptionCacheRequest,
  FetchUserSubscriptionCacheResponse,
  FetchPlanSubscriptionsCacheRequest,
  FetchPlanSubscriptionsCacheResponse,
  SaveSubscriptionCacheRequest,
  DropSubscriptionCacheRequest
} from './dto/index.js'
import { UserSubscriptionError } from './subscription-cache.errors.js'
import * as subscriptionCacheRepository from './subscription-cache.repository.js'

/*
 * Fetch SubscriptionCache
 */
export async function fetchSubscriptionCache(
  redis: Redis,
  request: FetchSubscriptionCacheRequest
): Promise<FetchSubscriptionCacheResponse> {
  const subscriptionCache = await subscriptionCacheRepository.fetchSubscriptionCache(
    redis,
    request.subscriptionId
  )

  return { subscriptionCache }
}

/*
 * Fetch User SubscriptionCache
 */
export async function fetchUserSubscriptionCache(
  redis: Redis,
  request: FetchUserSubscriptionCacheRequest
): Promise<FetchUserSubscriptionCacheResponse> {
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
 * Fetch Plan SubscriptionsCache
 */
export async function fetchPlanSubscriptionsCache(
  redis: Redis,
  request: FetchPlanSubscriptionsCacheRequest
): Promise<FetchPlanSubscriptionsCacheResponse> {
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
export async function saveSubscriptionCache(
  redis: Redis,
  request: SaveSubscriptionCacheRequest
): Promise<void> {
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
export async function dropSubscriptionCache(
  redis: Redis,
  request: DropSubscriptionCacheRequest
): Promise<void> {
  await subscriptionCacheRepository.dropSubscriptionCache(
    redis,
    request.subscriptionId,
    request.userId,
    request.planId
  )
}
