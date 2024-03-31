import { Redis } from 'ioredis'
import {
  FetchUserCacheRequest,
  FetchUserCacheResponse,
  FetchUsersCacheResponse,
  SaveUserCacheRequest,
  DropUserCacheRequest
} from './dto/index.js'
import * as userCacheRepository from './user-cache.repository.js'

/*
 * Fetch UserCache
 */
export async function fetchUserCache(
  redis: Redis,
  request: FetchUserCacheRequest
): Promise<FetchUserCacheResponse> {
  const userCache = await userCacheRepository.fetchUserCache(redis, request.userId)

  return { userCache }
}

/*
 * Fetch UsersCache
 */
export async function fetchUsersCache(redis: Redis): Promise<FetchUsersCacheResponse> {
  const userIds = await userCacheRepository.fetchUsers(redis)
  const usersCache = await userCacheRepository.fetchUsersCache(redis, userIds)

  return { usersCache }
}

/*
 * Save UserCache
 */
export async function saveUserCache(redis: Redis, request: SaveUserCacheRequest): Promise<void> {
  await userCacheRepository.saveUserCache(redis, request.userId, request.tgFromId)
}

/*
 * Drop UserCache
 */
export async function dropUserCache(redis: Redis, request: DropUserCacheRequest): Promise<void> {
  await userCacheRepository.dropUserCache(redis, request.userId)
}
