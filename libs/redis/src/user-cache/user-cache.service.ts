import { Redis } from 'ioredis'
import {
  FetchUserCacheRequest,
  FetchUserCacheResponse,
  FetchUsersCacheResponse,
  SaveUserCacheRequest,
  DropUserCacheRequest,
} from './dto/index.js'
import * as userCacheRepository from './user-cache.repository.js'

/*
 * Fetch UserCache
 */
export async function fetchUserCache(
  redis: Redis,
  request: FetchUserCacheRequest
): Promise<FetchUserCacheResponse> {
  const userCache = await userCacheRepository.fetchModel(redis, request.userId)

  return {
    userCache
  }
}

/*
 * Fetch UserCache
 */
export async function fetchUsersCache(redis: Redis): Promise<FetchUsersCacheResponse> {
  const userIds = await userCacheRepository.fetchIndex(redis)
  const usersCache = await userCacheRepository.fetchCollection(redis, userIds)

  return {
    usersCache
  }
}

/*
 * Save UserCache
 */
export async function saveUserCache(
  redis: Redis,
  request: SaveUserCacheRequest
): Promise<void> {
  await userCacheRepository.saveModel(redis, request.userId, request.tgFromId)
}

/*
 * Drop UserCache
 */
export async function dropUserCache(
  redis: Redis,
  request: DropUserCacheRequest
): Promise<void> {
  await userCacheRepository.dropModel(redis, request.userId)
}
