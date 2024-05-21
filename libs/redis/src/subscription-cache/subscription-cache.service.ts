import {
  FetchSubscriptionCache,
  FetchUserSubscriptionCache,
  FetchUserSubscriptionsCache,
  SaveSubscriptionCache,
  DropSubscriptionCache
} from './dto/index.js'
import { SubscriptionCacheNotFoundError } from './subscription-cache.errors.js'
import * as subscriptionCacheRepository from './subscription-cache.repository.js'
import { PlanCacheNotFoundError } from '../plan-cache/plan-cache.errors.js'
import * as planCacheRepository from '../plan-cache/plan-cache.repository.js'

/*
 * Fetch SubscriptionCache
 */
export const fetchSubscriptionCache: FetchSubscriptionCache = async function (redis, request) {
  const subscriptionCache = await subscriptionCacheRepository.fetchSubscriptionCache(
    redis,
    request.subscriptionId
  )

  if (subscriptionCache === undefined) {
    throw new SubscriptionCacheNotFoundError({ request })
  }

  return { subscriptionCache }
}

/*
 * Fetch UserSubscriptionCache
 */
export const fetchUserSubscriptionCache: FetchUserSubscriptionCache = async function (
  redis,
  request
) {
  const subscriptionCache = await subscriptionCacheRepository.fetchSubscriptionCache(
    redis,
    request.subscriptionId
  )

  if (subscriptionCache === undefined) {
    throw new SubscriptionCacheNotFoundError({ request })
  }

  if (subscriptionCache.userId !== request.userId) {
    throw new SubscriptionCacheNotFoundError({ request })
  }

  return { subscriptionCache }
}

/*
 * Fetch UserSubscriptionsCache
 */
export const fetchUserSubscriptionsCache: FetchUserSubscriptionsCache = async function (
  redis,
  request
) {
  const subscriptionIds = await subscriptionCacheRepository.fetchUserSubscriptionsIndex(
    redis,
    request.userId
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
export const saveSubscriptionCache: SaveSubscriptionCache = async function (redis, request) {
  await subscriptionCacheRepository.saveSubscriptionCache(
    redis,
    request.subscriptionId,
    request.userId,
    request.planId,
    request.priceRub,
    request.status,
    request.createdAt,
    request.updatedAt,
    request.queuedAt,
    request.timeoutAt,
    request.finishAt
  )
}

/*
 * Drop SubscriptionCache
 */
export const dropSubscriptionCache: DropSubscriptionCache = async function (redis, request) {
  await subscriptionCacheRepository.dropSubscriptionCache(
    redis,
    request.subscriptionId,
    request.userId
  )
}
