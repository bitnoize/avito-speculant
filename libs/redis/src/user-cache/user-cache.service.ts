import {
  FetchUserCache,
  FetchTelegramUserId,
  FetchWebappUserId,
  FetchUsersCache,
  SavePaidUserCache,
  SaveUnpaidUserCache,
  SaveWebappUserId,
} from './dto/index.js'
import {
  UserCacheNotFoundError,
  UserSubscriptionCacheLooseError,
  UserSubscriptionCacheWasteError,
} from './user-cache.errors.js'
import * as userCacheRepository from './user-cache.repository.js'
import { PlanCache } from '../plan-cache/plan-cache.js'
import { PlanCacheNotFoundError } from '../plan-cache/plan-cache.errors.js'
import * as planCacheRepository from '../plan-cache/plan-cache.repository.js'
import { SubscriptionCache } from '../subscription-cache/subscription-cache.js'
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

  let subscriptionCache: SubscriptionCache | undefined = undefined
  let planCache: PlanCache | undefined = undefined

  if (userCache.isPaid) {
    if (userCache.subscriptionId === null) {
      throw new UserSubscriptionCacheLooseError({ request, userCache }, 100)
    }

    subscriptionCache = await subscriptionCacheRepository.fetchSubscriptionCache(
      redis,
      userCache.subscriptionId
    )

    if (subscriptionCache === undefined) {
      throw new SubscriptionCacheNotFoundError({ request, userCache }, 100)
    }

    planCache = await planCacheRepository.fetchPlanCache(redis, subscriptionCache.planId)

    if (planCache === undefined) {
      throw new PlanCacheNotFoundError({ request, userCache, subscriptionCache }, 100)
    }
  } else {
    if (userCache.subscriptionId !== null) {
      throw new UserSubscriptionCacheWasteError({ request, userCache }, 100)
    }
  }

  return { userCache,  subscriptionCache, planCache }
}

/*
 * Fetch TelegramUserId
 */
export const fetchTelegramUserId: FetchTelegramUserId = async function (redis, request) {
  return await userCacheRepository.fetchTelegramUserId(redis, request.tgFromId)
}

/*
 * Fetch WebappUserId
 */
export const fetchWebappUserId: FetchWebappUserId = async function (redis, request) {
  return await userCacheRepository.fetchWebappUserId(redis, request.token)
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
 * Save PaidUserCache
 */
export const savePaidUserCache: SavePaidUserCache = async function (redis, request) {
  await userCacheRepository.savePaidUserCache(
    redis,
    request.userId,
    request.userTgFromId,
    request.userSubscriptions,
    request.userCategories,
    request.userBots,
    request.userCreatedAt,
    request.userUpdatedAt,
    request.userQueuedAt,
    request.planId,
    request.planCategoriesMax,
    request.planDurationDays,
    request.planIntervalSec,
    request.planAnalyticsOn,
    request.planPriceRub,
    request.planIsEnabled,
    request.planSubscriptions,
    request.planCreatedAt,
    request.planUpdatedAt,
    request.planQueuedAt,
    request.subscriptionId,
    request.subscriptionPriceRub,
    request.subscriptionStatus,
    request.subscriptionCreatedAt,
    request.subscriptionUpdatedAt,
    request.subscriptionQueuedAt,
    request.subscriptionTimeoutAt,
    request.subscriptionFinishAt
  )
}

/*
 * Save UnpaidUserCache
 */
export const saveUnpaidUserCache: SaveUnpaidUserCache = async function (redis, request) {
  await userCacheRepository.saveUnpaidUserCache(
    redis,
    request.userId,
    request.userTgFromId,
    request.userSubscriptions,
    request.userCategories,
    request.userBots,
    request.userCreatedAt,
    request.userUpdatedAt,
    request.userQueuedAt
  )
}

/*
 * Save WebappUserId
 */
export const saveWebappUserId: SaveWebappUserId = async function (redis, request) {
  await userCacheRepository.saveWebappUserId(
    redis,
    request.token,
    request.userId
  )
}
