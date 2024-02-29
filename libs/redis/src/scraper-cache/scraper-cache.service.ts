import { Redis } from 'ioredis'
import { Logger } from '@avito-speculant/logger'
import {
  ListScrapersCacheRequest,
  ListScrapersCacheResponse
} from './dto/list-scrapers-cache.js'
import * as scraperCacheRepository from './scraper-cache.repository.js'
import { parseNumber, parseString } from '../redis.utils.js'

export async function listScrapersCache(
  redis: Redis,
  request: ListScrapersCacheRequest
): Promise<ListScrapersCacheResponse> {
  const scrapersCacheIds = await cacheRepository.getIndex(redis)

  const scrapersCache = await cacheRepository.getList(redis, scrapersCacheIndex)

  return {
    message: `Cache scrapers listed`,
    statusCode: 200,
    scrapersCache,
  }
}

export async function readScraperCache(
  redis: Redis,
  request: FetchScraperRequest
): Promise<FetchScraperResponse> {
  const resultScraperJob = await redis.fetchScraperJobByAvitoUrlLua(redis, {
    cacheRepository.scraperJobAvitoUrlKey(request.avitoUrl) // KEYS[1]
  })

  if (resultScraperJob == null) {
    message: `ScraperCache miss`,
    statusCode: 404
  }

  const scraperJobId = parseString(resultScraperJob)

  const result

  return {
    message: `ScraperCache hit`,
    statusCode: 200,
    scraperJobId,
  }
}







export async function storeModel(
  redis: Redis,
  request: StoreUserModelRequest
): Promise<StoreUserModelResponse> {
  await redis.cacheStoreUserModel(
    cacheRepository.modelKey(request.user.id), // KEYS[1]
    request.user.id, // ARGV[1]
    request.user.tgFromId, // ARGV[2]
    request.user.status, // ARGV[3]
    request.user.subscriptions, // ARGV[4]
    request.user.categories, // ARGV[5]
    request.user.createdAt, // ARGV[6]
    request.user.updatedAt, // ARGV[7]
    request.user.queuedAt, // ARGV[8]
    request.timeout // ARGV[9]
  )

  return {
    message: `UserModel cache updated`,
    statusCode: 200,
  }
}

export async function fetchModel(
  redis: Redis,
  request: FetchUserModelRequest
): Promise<FetchUserModelResponse> {
  const result = await redis.cacheFetchUserModel(
    cacheRepository.modelKey(request.userId) // KEYS[1]
  )

  if (result == null) {
    return {
      message: `UserModel cache miss`,
      statusCode: 410,
      user: undefined
    }
  }

  const user = cacheRepository.buildModel(result, request.force)

  return {
    message: `UserModel cache hit`,
    statusCode: user === undefined ? 409 : 200,
    user
  }
}
