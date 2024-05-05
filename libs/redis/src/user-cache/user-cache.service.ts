import {
  FetchUserCache,
  FetchTelegramUserCache,
  FetchWebappUserCache,
  FetchUsersCache,
  SavePaidUserCache,
  SaveUnpaidUserCache,
} from './dto/index.js'
import {
  UserSubscriptionCacheLooseError,
  UserSubscriptionCacheWasteError,
} from './user-cache.errors.js'
import { UserCache } from './user-cache.js'
import { UserCacheNotFoundError } from './user-cache.errors.js'
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
  let subscriptionCache: SubscriptionCache | undefined = undefined
  let planCache: PlanCache | undefined = undefined

  const userCache = await userCacheRepository.fetchUserCache(redis, request.userId)

  if (userCache === undefined) {
    throw new UserCacheNotFoundError({ request })
  }

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
 * Fetch TelegramUserCache
 */
export const fetchTelegramUserCache: FetchTelegramUserCache = async function (redis, request) {
  let userCache: UserCahce | undefined  = undefined
  let subscriptionCache: SubscriptionCahce | undefined  = undefined
  let planCache: PlanCahce | undefined  = undefined

  const userId = await userCacheRepository.fetchTelegramUserId(redis, request.tgFromId)

  if (userId === undefined) {
    return { userCache, subscriptionCache, planCache }
  }

  userCache = await userCacheRepository.fetchUserCache(redis, userId)

  if (userCache === undefined) {
    throw new UserCacheNotFoundError({ request, userId }, 100)
  }

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

  return { userCache, planCache, subscriptionCache }
}

/*
 * Fetch WebappUserCache
 */
export const fetchWebappUserCache: FetchWebappUserCache = async function (redis, request) {
  let userCache: UserCahce | undefined  = undefined
  let subscriptionCache: SubscriptionCahce | undefined  = undefined
  let planCache: PlanCahce | undefined  = undefined

  const userId = await userCacheRepository.fetchWebappUserId(redis, request.token)

  if (userId === undefined) {
    return { userCache, subscriptionCache, planCache }
  }

  userCache = await userCacheRepository.fetchUserCache(redis, userId)

  if (userCache === undefined) {
    throw new UserCacheNotFoundError({ request, userId }, 100)
  }

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

  return { userCache, planCache, subscriptionCache }
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
 * Save Paid UserCache
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
 * Save Unpaid UserCache
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
 * Drop UserCache
 */
//export const dropUserCache: DropUserCache = async function (redis, request) {
//  await userCacheRepository.dropUserCache(redis, request.userId)
//}

/*
 * Renew UserCache
 */
//export const renewUserCache: RenewUserCache = async function (redis, request) {
//  await userCacheRepository.renewUserCache(redis, request.userId, request.checkpointAt)
//}
