import { Redis } from 'ioredis'
import {
  FetchCategoryCacheRequest,
  FetchCategoryCacheResponse,
  SaveCategoryCacheRequest,
  SaveCategoryCacheResponse,
  DropCategoryCacheRequest,
  DropCategoryCacheResponse,
  ListUserCategoriesCacheRequest,
  ListUserCategoriesCacheResponse,
  ListScraperCategoriesCacheRequest,
  ListScraperCategoriesCacheResponse
} from './dto/index.js'
import * as categoryCacheRepository from './category-cache.repository.js'

export async function fetchCategoryCache(
  redis: Redis,
  request: FetchCategoryCacheRequest
): Promise<FetchCategoryCacheResponse> {
  const categoryCache = await categoryCacheRepository.fetchModel(redis, request.categoryId)

  return {
    message: `CategoryCache successfully fetched`,
    statusCode: 200,
    categoryCache
  }
}

export async function saveCategoryCache(
  redis: Redis,
  request: SaveCategoryCacheRequest
): Promise<SaveCategoryCacheResponse> {
  await categoryCacheRepository.saveModel(
    redis,
    request.categoryId,
    request.userId,
    request.scraperJobId,
    request.avitoUrl,
    request.timeout
  )

  return {
    message: `CategoryCache successfully saved`,
    statusCode: 200
  }
}

export async function dropCategoryCache(
  redis: Redis,
  request: DropCategoryCacheRequest
): Promise<DropCategoryCacheResponse> {
  await categoryCacheRepository.dropModel(
    redis,
    request.categoryId,
    request.userId,
    request.scraperJobId,
    request.timeout
  )

  return {
    message: `CategoryCache successfully dropped`,
    statusCode: 200
  }
}

export async function listUserCategoriesCache(
  redis: Redis,
  request: ListUserCategoriesCacheRequest
): Promise<ListUserCategoriesCacheResponse> {
  const categoryIds = await categoryCacheRepository.fetchUserIndex(redis, request.userId)
  const categoriesCache = await categoryCacheRepository.fetchCollection(redis, categoryIds)

  return {
    message: `CategoriesCache successfully listed`,
    statusCode: 200,
    categoriesCache
  }
}

export async function listScraperCategoriesCache(
  redis: Redis,
  request: ListScraperCategoriesCacheRequest
): Promise<ListScraperCategoriesCacheResponse> {
  const categoryIds = await categoryCacheRepository.fetchScraperIndex(redis, request.scraperJobId)
  const categoriesCache = await categoryCacheRepository.fetchCollection(redis, categoryIds)

  return {
    message: `CategoriesCache successfully listed`,
    statusCode: 200,
    categoriesCache
  }
}
