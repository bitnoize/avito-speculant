import { Redis } from 'ioredis'
import {
  FetchCategoryCacheRequest,
  FetchCategoryCacheResponse,
  FetchUserCategoriesCacheRequest,
  FetchUserCategoriesCacheResponse,
  FetchScraperCategoriesCacheRequest,
  FetchScraperCategoriesCacheResponse,
  SaveScraperCategoryCacheRequest,
  DropScraperCategoryCacheRequest
} from './dto/index.js'
import * as categoryCacheRepository from './category-cache.repository.js'

/*
 * Fetch CategoryCache
 */
export async function fetchCategoryCache(
  redis: Redis,
  request: FetchCategoryCacheRequest
): Promise<FetchCategoryCacheResponse> {
  const categoryCache = await categoryCacheRepository.fetchCategoryCache(redis, request.categoryId)

  return { categoryCache }
}

/*
 * Fetch User CategoryCache
 */
export async function fetchUserCategoriesCache(
  redis: Redis,
  request: FetchUserCategoriesCacheRequest
): Promise<FetchUserCategoriesCacheResponse> {
  const categoryIds = await categoryCacheRepository.fetchUserCategories(redis, request.userId)
  const categoriesCache = await categoryCacheRepository.fetchCategoriesCache(redis, categoryIds)

  return { categoriesCache }
}

/*
 * Fetch Scraper CategoryCache
 */
export async function fetchScraperCategoriesCache(
  redis: Redis,
  request: FetchScraperCategoriesCacheRequest
): Promise<FetchScraperCategoriesCacheResponse> {
  const categoryIds = await categoryCacheRepository.fetchScraperCategories(redis, request.scraperId)
  const categoriesCache = await categoryCacheRepository.fetchCategoriesCache(redis, categoryIds)

  return { categoriesCache }
}

/*
export async function saveCategoryCache(
  redis: Redis,
  request: SaveCategoryCacheRequest
): Promise<void> {
  await categoryCacheRepository.saveCategoryCache(
    redis,
    request.categoryId,
    request.userId,
    request.scraperId,
    request.avitoUrl
  )
}
export async function dropCategoryCache(
  redis: Redis,
  request: DropCategoryCacheRequest
): Promise<void> {
  await categoryCacheRepository.dropCategoryCache(
    redis,
    request.categoryId,
    request.userId,
    request.scraperId
  )
}
*/

/*
 * Save ScraperCategoryCache
 */
export async function saveScraperCategoryCache(
  redis: Redis,
  request: SaveScraperCategoryCacheRequest
): Promise<void> {
  await categoryCacheRepository.saveScraperCategoryCache(
    redis,
    request.categoryId,
    request.userId,
    request.scraperId,
    request.avitoUrl,
    request.intervalSec
  )
}

/*
 * Drop ScraperCategoryCache
 */
export async function dropScraperCategoryCache(
  redis: Redis,
  request: DropScraperCategoryCacheRequest
): Promise<void> {
  await categoryCacheRepository.dropScraperCategoryCache(
    redis,
    request.categoryId,
    request.userId,
    request.scraperId,
    request.avitoUrl
  )
}
