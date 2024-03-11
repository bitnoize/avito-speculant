import { Redis } from 'ioredis'
import {
  FetchUserCacheRequest,
  FetchUserCacheResponse,
  ListUsersCacheResponse,
  SaveUserCacheRequest,
  SaveUserCacheResponse,
  DropUserCacheRequest,
  DropUserCacheResponse
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
    message: `UserCache successfully fetched`,
    userCache
  }
}

/*
 * List UserCache
 */
export async function listUsersCache(redis: Redis): Promise<ListUsersCacheResponse> {
  const userIds = await userCacheRepository.fetchIndex(redis)
  const usersCache = await userCacheRepository.fetchCollection(redis, userIds)

  return {
    message: `UsersCache successfully listed`,
    usersCache
  }
}

/*
 * Save UserCache
 */
export async function saveUserCache(
  redis: Redis,
  request: SaveUserCacheRequest
): Promise<SaveUserCacheResponse> {
  await userCacheRepository.saveModel(redis, request.userId, request.tgFromId)

  return {
    message: `UserCache successfully saved`,
  }
}

/*
 * Drop UserCache
 */
export async function dropUserCache(
  redis: Redis,
  request: DropUserCacheRequest
): Promise<DropUserCacheResponse> {
  await userCacheRepository.dropModel(redis, request.userId)

  return {
    message: `UserCache successfully dropped`,
  }
}
