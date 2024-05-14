import {
  FetchUserCache,
  FetchTelegramUserLink,
  FetchWebappUserLink,
  FetchUsersCache,
  SaveUserCache,
  SaveWebappUserLink,
  DropUserCache
} from './dto/index.js'
import { UserCacheNotFoundError } from './user-cache.errors.js'
import * as userCacheRepository from './user-cache.repository.js'
import { PlanCacheNotFoundError } from '../plan-cache/plan-cache.errors.js'
import * as planCacheRepository from '../plan-cache/plan-cache.repository.js'
import { SubscriptionCacheNotFoundError } from '../subscription-cache/subscription-cache.errors.js'
import * as subscriptionCacheRepository from '../subscription-cache/subscription-cache.repository.js'

/*
 * Fetch UserCache
 */
export const fetchUserCache: FetchUserCache = async function (redis, request) {
  const userCache = await userCacheRepository.fetchUserCache(redis, request.userId)

  if (userCache === undefined) {
    throw new UserCacheNotFoundError({ request })
  }

  const activeSubscriptionId = await subscriptionCacheRepository.fetchUserActiveSubscriptionLink(
    redis,
    userCache.id
  )

  if (activeSubscriptionId !== undefined) {
    const subscriptionCache = await subscriptionCacheRepository.fetchSubscriptionCache(
      redis,
      activeSubscriptionId
    )

    if (subscriptionCache === undefined) {
      throw new SubscriptionCacheNotFoundError({ request, userCache }, 100)
    }

    userCache.activeSubscriptionId = subscriptionCache.id

    const planCache = await planCacheRepository.fetchPlanCache(redis, subscriptionCache.planId)

    if (planCache === undefined) {
      throw new PlanCacheNotFoundError({ request, userCache, subscriptionCache }, 100)
    }

    return { userCache, subscriptionCache, planCache }
  } else {
    userCache.activeSubscriptionId = null

    return { userCache }
  }
}

/*
 * Fetch TelegramUserLink
 */
export const fetchTelegramUserLink: FetchTelegramUserLink = async function (redis, request) {
  return await userCacheRepository.fetchTelegramUserLink(redis, request.tgFromId)
}

/*
 * Fetch WebappUserLink
 */
export const fetchWebappUserLink: FetchWebappUserLink = async function (redis, request) {
  return await userCacheRepository.fetchWebappUserLink(redis, request.token)
}

/*
 * Fetch UsersCache
 */
export const fetchUsersCache: FetchUsersCache = async function (redis) {
  const userIds = await userCacheRepository.fetchUsersIndex(redis)
  const usersCache = await userCacheRepository.fetchUsersCache(redis, userIds)

  return { usersCache }
}

/*
 * Save UserCache
 */
export const saveUserCache: SaveUserCache = async function (redis, request) {
  await userCacheRepository.saveUserCache(
    redis,
    request.userId,
    request.tgFromId,
    request.activeSubscriptionId,
    request.subscriptions,
    request.categories,
    request.bots,
    request.createdAt,
    request.updatedAt,
    request.queuedAt
  )
}

/*
 * Save WebappUserLink
 */
export const saveWebappUserLink: SaveWebappUserLink = async function (redis, request) {
  await userCacheRepository.saveWebappUserLink(redis, request.token, request.userId)
}

/*
 * Drop UserCache
 */
export const dropUserCache: DropUserCache = async function (redis, request) {
  await userCacheRepository.dropUserCache(redis, request.userId, request.tgFromId)
}
