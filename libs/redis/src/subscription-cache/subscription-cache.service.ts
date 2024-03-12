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
import * as subscriptionCacheRepository from './subscription-cache.repository.js'

/*
 * Fetch SubscriptionCache
 */
export async function fetchSubscriptionCache(
  redis: Redis,
  request: FetchSubscriptionCacheRequest
): Promise<FetchSubscriptionCacheResponse> {
  const subscriptionCache = await subscriptionCacheRepository.fetchModel(
    redis,
    request.subscriptionId
  )

  return {
    subscriptionCache
  }
}

/*
 * Fetch User SubscriptionCache
 */
export async function fetchUserSubscriptionCache(
  redis: Redis,
  request: FetchUserSubscriptionCacheRequest
): Promise<FetchUserSubscriptionCacheResponse> {
  const subscriptionId = await subscriptionCacheRepository.fetchUserIndex(redis, request.userId)
  const subscriptionCache = await subscriptionCacheRepository.fetchModel(redis, subscriptionId)

  return {
    subscriptionCache
  }
}

/*
 * Fetch Plan SubscriptionsCache
 */
export async function fetchPlanSubscriptionsCache(
  redis: Redis,
  request: FetchPlanSubscriptionsCacheRequest
): Promise<FetchPlanSubscriptionsCacheResponse> {
  const subscriptionIds = await subscriptionCacheRepository.fetchPlanIndex(redis, request.planId)
  const subscriptionsCache = await subscriptionCacheRepository.fetchCollection(
    redis,
    subscriptionIds
  )

  return {
    subscriptionsCache
  }
}

/*
 * Save SubscriptionCache
 */
export async function saveSubscriptionCache(
  redis: Redis,
  request: SaveSubscriptionCacheRequest
): Promise<void> {
  await subscriptionCacheRepository.saveModel(
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
  await subscriptionCacheRepository.dropModel(
    redis,
    request.subscriptionId,
    request.userId,
    request.planId
  )
}
