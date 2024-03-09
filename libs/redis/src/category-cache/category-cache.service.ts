import { Redis } from 'ioredis'
import {
  FetchCategoryCacheRequest,
  FetchCategoryCacheResponse,
  ListUserCategoriesCacheRequest,
  ListUserCategoriesCacheResponse,
  ListScraperCategoriesCacheRequest,
  ListScraperCategoriesCacheResponse,
  SaveCategoryCacheRequest,
  SaveCategoryCacheResponse,
  DropCategoryCacheRequest,
  DropCategoryCacheResponse
} from './dto/index.js'
import * as categoryCacheRepository from './category-cache.repository.js'

/*
 * Fetch CategoryCache
 */
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

/*
 * List User CategoryCache
 */
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

/*
 * List Scraper CategoryCache
 */
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

/*
 * Save CategoryCache
 */
export async function saveCategoryCache(
  redis: Redis,
  request: SaveCategoryCacheRequest
): Promise<SaveCategoryCacheResponse> {
  await categoryCacheRepository.saveModel(
    redis,
    request.categoryId,
    request.userId,
    request.scraperJobId,
    request.avitoUrl
  )

  return {
    message: `CategoryCache successfully saved`,
    statusCode: 200
  }
}

/*
 * Drop CategoryCache
 */
export async function dropCategoryCache(
  redis: Redis,
  request: DropCategoryCacheRequest
): Promise<DropCategoryCacheResponse> {
  await categoryCacheRepository.dropModel(
    redis,
    request.categoryId,
    request.userId,
    request.scraperJobId
  )

  return {
    message: `CategoryCache successfully dropped`,
    statusCode: 200
  }
}
