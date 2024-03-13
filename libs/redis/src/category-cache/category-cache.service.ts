import { Redis } from 'ioredis'
import {
  FetchCategoryCacheRequest,
  FetchCategoryCacheResponse,
  FetchUserCategoriesCacheRequest,
  FetchUserCategoriesCacheResponse,
  FetchScraperCategoriesCacheRequest,
  FetchScraperCategoriesCacheResponse,
  SaveCategoryCacheRequest,
  DropCategoryCacheRequest
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
    categoryCache
  }
}

/*
 * Fetch User CategoryCache
 */
export async function fetchUserCategoriesCache(
  redis: Redis,
  request: FetchUserCategoriesCacheRequest
): Promise<FetchUserCategoriesCacheResponse> {
  const categoryIds = await categoryCacheRepository.fetchUserIndex(redis, request.userId)
  const categoriesCache = await categoryCacheRepository.fetchCollection(redis, categoryIds)

  return {
    categoriesCache
  }
}

/*
 * Fetch Scraper CategoryCache
 */
export async function fetchScraperCategoriesCache(
  redis: Redis,
  request: FetchScraperCategoriesCacheRequest
): Promise<FetchScraperCategoriesCacheResponse> {
  const categoryIds = await categoryCacheRepository.fetchScraperIndex(redis, request.scraperJobId)
  const categoriesCache = await categoryCacheRepository.fetchCollection(redis, categoryIds)

  return {
    categoriesCache
  }
}

/*
 * Save CategoryCache
 */
export async function saveCategoryCache(
  redis: Redis,
  request: SaveCategoryCacheRequest
): Promise<void> {
  await categoryCacheRepository.saveModel(
    redis,
    request.categoryId,
    request.userId,
    request.scraperJobId,
    request.avitoUrl
  )
}

/*
 * Drop CategoryCache
 */
export async function dropCategoryCache(
  redis: Redis,
  request: DropCategoryCacheRequest
): Promise<void> {
  await categoryCacheRepository.dropModel(
    redis,
    request.categoryId,
    request.userId,
    request.scraperJobId
  )
}
