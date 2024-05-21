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

  return { userCache }
}

/*
 * Fetch TelegramUserLink
 */
export const fetchTelegramUserLink: FetchTelegramUserLink = async function (redis, request) {
  const userId = await userCacheRepository.fetchTelegramUserLink(redis, request.tgFromId)

  return { userId }
}

/*
 * Fetch WebappUserLink
 */
export const fetchWebappUserLink: FetchWebappUserLink = async function (redis, request) {
  const userId = await userCacheRepository.fetchWebappUserLink(redis, request.session)

  return { userId }
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
  await userCacheRepository.saveWebappUserLink(redis, request.session, request.userId)
}

/*
 * Drop UserCache
 */
export const dropUserCache: DropUserCache = async function (redis, request) {
  await userCacheRepository.dropUserCache(redis, request.userId, request.tgFromId)
}
