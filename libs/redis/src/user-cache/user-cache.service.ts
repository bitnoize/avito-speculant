import { Redis } from 'ioredis'
import { SaveUserCacheRequest, SaveUserCacheResponse } from './dto/save-user-cache.js'
import { FetchUserCacheRequest, FetchUserCacheResponse } from './dto/fetch-user-cache.js'
import { DropUserCacheRequest, DropUserCacheResponse } from './dto/drop-user-cache.js'
import { ListUsersCacheResponse } from './dto/list-users-cache.js'
import * as userCacheRepository from './user-cache.repository.js'
import * as subscriptionCacheRepository from '../subscription-cache/subscription-cache.repository.js'

export async function saveUserCache(
  redis: Redis,
  request: SaveUserCacheRequest
): Promise<SaveUserCacheResponse> {
  await userCacheRepository.saveModel(redis, request.userId, request.tgFromId, request.timeout)

  return {
    message: `UserCache successfully saved`,
    statusCode: 200
  }
}

export async function fetchUserCache(
  redis: Redis,
  request: FetchUserCacheRequest
): Promise<FetchUserCacheResponse> {
  const userCache = await userCacheRepository.fetchModel(redis, request.userId)

  const subscriptionid = await subscriptionCacheRepository.fetchUserIndex(redis, userCache.id)
  const subscriptionCache = await subscriptionCacheRepository.fetchModel(redis, subscriptionid)

  return {
    message: `UserCache successfully fetched`,
    statusCode: 200,
    userCache,
    subscriptionCache
  }
}

export async function dropUserCache(
  redis: Redis,
  request: DropUserCacheRequest
): Promise<DropUserCacheResponse> {
  await userCacheRepository.dropModel(redis, request.userId)

  return {
    message: `UserCache successfully dropped`,
    statusCode: 200
  }
}

export async function listUsersCache(redis: Redis): Promise<ListUsersCacheResponse> {
  const userIds = await userCacheRepository.fetchIndex(redis)
  const usersCache = await userCacheRepository.fetchCollection(redis, userIds)

  return {
    message: `UsersCache successfully listed`,
    statusCode: 200,
    usersCache
  }
}
