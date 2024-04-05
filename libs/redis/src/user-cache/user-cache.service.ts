import {
  FetchUserCache,
  FetchUsersCache,
  SaveUserCache,
  DropUserCache,
  RenewUserCache
} from './dto/index.js'
import * as userCacheRepository from './user-cache.repository.js'

/*
 * Fetch UserCache
 */
export const fetchUserCache: FetchUserCache = async function(redis, request) {
  const userCache = await userCacheRepository.fetchUserCache(redis, request.userId)

  return { userCache }
}

/*
 * Fetch UsersCache
 */
export const fetchUsersCache: FetchUsersCache = async function(redis) {
  const userIds = await userCacheRepository.fetchUsers(redis)
  const usersCache = await userCacheRepository.fetchUsersCache(redis, userIds)

  return { usersCache }
}

/*
 * Save UserCache
 */
export const saveUserCache: SaveUserCache = async function(redis, request) {
  await userCacheRepository.saveUserCache(
    redis,
    request.userId,
    request.tgFromId,
    request.checkpoint
  )
}

/*
 * Drop UserCache
 */
export const dropUserCache: DropUserCache = async function(redis, request) {
  await userCacheRepository.dropUserCache(redis, request.userId)
}

/*
 * Renew UserCache
 */
export const renewUserCache: RenewUserCache = async function(redis, request) {
  await userCacheRepository.renewUserCache(redis, request.userId, request.checkpoint)
}
