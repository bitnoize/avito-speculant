import {
  FetchCategoryCache,
  FetchUserCategoryCache,
  FetchUserCategoriesCache,
  FetchScraperCategoriesCache,
  SaveCategoryCache,
  SaveProvisoCategoryCache,
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
 * Fetch UserCategoryCache
 */
export const fetchUserCategoryCache: FetchUserCategoryCache = async function (redis, request) {
  const categoryCache = await categoryCacheRepository.fetchCategoryCache(redis, request.categoryId)

  if (categoryCache === undefined) {
    throw new CategoryCacheNotFoundError({ request })
  }

  if (categoryCache.userId !== request.userId) {
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
 * Fetch ScraperCategoriesCache
 */
export const fetchScraperCategoriesCache: FetchScraperCategoriesCache = async function (
  redis,
  request
) {
  const categoryIds = await categoryCacheRepository.fetchScraperCategoriesIndex(
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
 * Save ProvisoCategoryCache
 */
export const saveProvisoCategoryCache: SaveProvisoCategoryCache = async function (redis, request) {
  await categoryCacheRepository.saveProvisoCategoryCache(
    redis,
    request.categoryId,
    request.reportedAt
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
