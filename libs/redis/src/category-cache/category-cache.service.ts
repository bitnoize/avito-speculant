import {
  FetchCategoryCache,
  FetchUserCategoriesCache,
  FetchScraperEnabledCategoriesCache,
  SaveCategoryCache,
  DropCategoryCache
} from './dto/index.js'
import { CategoryCacheNotFoundError } from './category-cache.errors.js'
import * as categoryCacheRepository from './category-cache.repository.js'

/*
 * Fetch CategoryCache
 */
export const fetchCategoryCache: FetchCategoryCache = async function (redis, request) {
  const categoryCache = await categoryCacheRepository.fetchCategoryCache(redis, request.categoryId)

  if (categoryCache === undefined) {
    throw new CategoryCacheNotFoundError({ request })
  }

  return { categoryCache }
}

/*
 * Fetch UserCategoriesCache
 */
export const fetchUserCategoriesCache: FetchUserCategoriesCache = async function (redis, request) {
  const categoryIds = await categoryCacheRepository.fetchUserCategoriesIndex(redis, request.userId)
  const categoriesCache = await categoryCacheRepository.fetchCategoriesCache(redis, categoryIds)

  return { categoriesCache }
}

/*
 * Fetch ScraperEnabledCategoriesCache
 */
export const fetchScraperEnabledCategoriesCache: FetchScraperEnabledCategoriesCache = async function (
  redis,
  request
) {
  const categoryIds = await categoryCacheRepository.fetchScraperEnabledCategoriesIndex(
    redis,
    request.scraperId
  )
  const categoriesCache = await categoryCacheRepository.fetchCategoriesCache(redis, categoryIds)

  return { categoriesCache }
}

/*
 * Save CategoryCache
 */
export const saveCategoryCache: SaveCategoryCache = async function (redis, request) {
  await categoryCacheRepository.saveCategoryCache(
    redis,
    request.categoryId,
    request.userId,
    request.urlPath,
    request.botId,
    request.scraperId,
    request.isEnabled,
    request.createdAt,
    request.updatedAt,
    request.queuedAt
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
