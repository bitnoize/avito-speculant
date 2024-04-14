import {
  FetchCategoryCache,
  FetchUserCategoriesCache,
  FetchScraperCategoriesCache,
  SaveScraperCategoryCache,
  DropCategoryCache
} from './dto/index.js'
import * as categoryCacheRepository from './category-cache.repository.js'

/*
 * Fetch CategoryCache
 */
export const fetchCategoryCache: FetchCategoryCache = async function (redis, request) {
  const categoryCache = await categoryCacheRepository.fetchCategoryCache(redis, request.categoryId)

  return { categoryCache }
}

/*
 * Fetch UserCategoriesCache
 */
export const fetchUserCategoriesCache: FetchUserCategoriesCache = async function (redis, request) {
  const categoryIds = await categoryCacheRepository.fetchUserCategories(redis, request.userId)
  const categoriesCache = await categoryCacheRepository.fetchCategoriesCache(redis, categoryIds)

  return { categoriesCache }
}

/*
 * Fetch ScraperCategoriesCache
 */
export const fetchScraperCategoriesCache: FetchScraperCategoriesCache = async function (
  redis,
  request
) {
  const categoryIds = await categoryCacheRepository.fetchScraperCategories(redis, request.scraperId)
  const categoriesCache = await categoryCacheRepository.fetchCategoriesCache(redis, categoryIds)

  return { categoriesCache }
}

/*
 * Save ScraperCategoryCache
 */
export const saveScraperCategoryCache: SaveScraperCategoryCache = async function (redis, request) {
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
 * Drop CategoryCache
 */
export const dropCategoryCache: DropCategoryCache = async function (redis, request) {
  await categoryCacheRepository.dropCategoryCache(
    redis,
    request.categoryId,
    request.userId,
    request.scraperId
  )
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
*/
