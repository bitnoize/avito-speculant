import { Redis } from 'ioredis'
import {
  SaveSubscriptionCacheRequest,
  SaveSubscriptionCacheResponse
} from './dto/save-subscription-cache.js'
import {
  FetchSubscriptionCacheRequest,
  FetchSubscriptionCacheResponse
} from './dto/fetch-subscription-cache.js'
import {
  DropSubscriptionCacheRequest,
  DropSubscriptionCacheResponse
} from './dto/drop-subscription-cache.js'
import {
  FetchUserSubscriptionCacheRequest,
  FetchUserSubscriptionCacheResponse
} from './dto/fetch-user-subscription-cache.js'
import {
  ListPlanSubscriptionsCacheRequest,
  ListPlanSubscriptionsCacheResponse
} from './dto/list-plan-subscriptions-cache.js'
import * as subscriptionCacheRepository from './subscription-cache.repository.js'

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
    request.analyticsOn,
    request.timeout
  )

  return {
    message: `SubscriptionCache successfully saved`,
    statusCode: 200
  }
}

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
    statusCode: 200,
    subscriptionCache
  }
}

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
    statusCode: 200
  }
}

export async function fetchUserSubscriptionCache(
  redis: Redis,
  request: FetchUserSubscriptionCacheRequest
): Promise<FetchUserSubscriptionCacheResponse> {
  const subscriptionId = await subscriptionCacheRepository.fetchUserIndex(redis, request.userId)
  const subscriptionCache = await subscriptionCacheRepository.fetchModel(redis, subscriptionId)

  return {
    message: `SubscriptionCache successfully fetched by User`,
    statusCode: 200,
    subscriptionCache
  }
}

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
    statusCode: 200,
    subscriptionsCache
  }
}
