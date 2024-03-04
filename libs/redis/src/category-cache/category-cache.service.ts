import { Redis } from 'ioredis'
import { SaveCategoryCacheRequest, SaveCategoryCacheResponse } from './dto/save-category-cache.js'
import {
  FetchCategoryCacheRequest,
  FetchCategoryCacheResponse
} from './dto/fetch-category-cache.js'
import { DropCategoryCacheRequest, DropCategoryCacheResponse } from './dto/drop-category-cache.js'
import {
  ListUserCategoriesCacheRequest,
  ListUserCategoriesCacheResponse
} from './dto/list-user-categories-cache.js'
import {
  AttachDetachScraperCategoryCacheRequest,
  AttachDetachScraperCategoryCacheResponse
} from './dto/attach-detach-scraper-category-cache.js'
import {
  ListScraperCategoriesCacheRequest,
  ListScraperCategoriesCacheResponse
} from './dto/list-scraper-categories-cache.js'
import * as categoryCacheRepository from './category-cache.repository.js'

export async function saveCategoryCache(
  redis: Redis,
  request: SaveCategoryCacheRequest
): Promise<SaveCategoryCacheResponse> {
  await categoryCacheRepository.saveModel(
    redis,
    request.categoryId,
    request.userId,
    request.avitoUrl,
    request.timeout
  )

  return {
    message: `CategoryCache successfully saved`,
    statusCode: 200
  }
}

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

export async function dropCategoryCache(
  redis: Redis,
  request: DropCategoryCacheRequest
): Promise<DropCategoryCacheResponse> {
  await categoryCacheRepository.dropModel(redis, request.categoryId, request.userId)

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
    message: `CategoriesCache successfully listed by User`,
    statusCode: 200,
    categoriesCache
  }
}

export async function attachScraperCategoryCache(
  redis: Redis,
  request: AttachDetachScraperCategoryCacheRequest
): Promise<AttachDetachScraperCategoryCacheResponse> {
  await categoryCacheRepository.attachScraper(
    redis,
    request.categoryId,
    request.scraperJobId,
    request.timeout
  )

  return {
    message: `CategoryCache successfully attach Scraper`,
    statusCode: 200
  }
}

export async function detachScraperCategoryCache(
  redis: Redis,
  request: AttachDetachScraperCategoryCacheRequest
): Promise<AttachDetachScraperCategoryCacheResponse> {
  await categoryCacheRepository.detachScraper(
    redis,
    request.categoryId,
    request.scraperJobId,
    request.timeout
  )

  return {
    message: `CategoryCache successfully detach Scraper`,
    statusCode: 200
  }
}

export async function listScraperCategoriesCache(
  redis: Redis,
  request: ListScraperCategoriesCacheRequest
): Promise<ListScraperCategoriesCacheResponse> {
  const categoryIds = await categoryCacheRepository.fetchScraperIndex(redis, request.scraperJobId)
  const categoriesCache = await categoryCacheRepository.fetchCollection(redis, categoryIds)

  return {
    message: `CategoriesCache successfully listed by Scraper`,
    statusCode: 200,
    categoriesCache
  }
}
