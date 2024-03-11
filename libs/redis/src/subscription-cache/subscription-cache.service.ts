import { Redis } from 'ioredis'
import {
  FetchSubscriptionCacheRequest,
  FetchSubscriptionCacheResponse,
  FetchUserSubscriptionCacheRequest,
  FetchUserSubscriptionCacheResponse,
  ListPlanSubscriptionsCacheRequest,
  ListPlanSubscriptionsCacheResponse,
  SaveSubscriptionCacheRequest,
  SaveSubscriptionCacheResponse,
  DropSubscriptionCacheRequest,
  DropSubscriptionCacheResponse
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
    message: `SubscriptionCache successfully fetched`,
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
    message: `SubscriptionCache successfully fetched`,
    subscriptionCache
  }
}

/*
 * List Plan SubscriptionsCache
 */
export async function listPlanSubscriptionsCache(
  redis: Redis,
  request: ListPlanSubscriptionsCacheRequest
): Promise<ListPlanSubscriptionsCacheResponse> {
  const subscriptionIds = await subscriptionCacheRepository.fetchPlanIndex(redis, request.planId)
  const subscriptionsCache = await subscriptionCacheRepository.fetchCollection(
    redis,
    subscriptionIds
  )

  return {
    message: `PlanSubscriptionsCache successfully listed`,
    subscriptionsCache
  }
}

/*
 * Save SubscriptionCache
 */
export async function saveSubscriptionCache(
  redis: Redis,
  request: SaveSubscriptionCacheRequest
): Promise<SaveSubscriptionCacheResponse> {
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

  return {
    message: `SubscriptionCache successfully saved`,
  }
}

/*
 * Drop SubscriptionCache
 */
export async function dropSubscriptionCache(
  redis: Redis,
  request: DropSubscriptionCacheRequest
): Promise<DropSubscriptionCacheResponse> {
  await subscriptionCacheRepository.dropModel(
    redis,
    request.subscriptionId,
    request.userId,
    request.planId
  )

  return {
    message: `SubscriptionCache successfully dropped`,
  }
}
